import { ApiError } from "../src/lib/api-response";
import {
  createContactForUser,
  getContactForUser,
  updateContactForUser,
} from "../src/lib/contact-service";
import { buildContactWhere, type ContactView } from "../src/lib/contacts";
import { prisma } from "../src/lib/prisma";
import { contactCreateSchema } from "../src/lib/validation/contact";

let failures = 0;

function pass(label: string) {
  console.log(`OK   ${label}`);
}

function fail(label: string, detail: string) {
  failures += 1;
  console.error(`FAIL ${label}: ${detail}`);
}

function check(label: string, condition: boolean, detail = "condition not met") {
  if (condition) {
    pass(label);
  } else {
    fail(label, detail);
  }
}

async function expectNotFound(label: string, action: () => Promise<unknown>) {
  try {
    await action();
    fail(label, "expected ApiError 404 but the call succeeded");
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      pass(label);
    } else {
      const detail =
        error instanceof Error ? `${error.name}: ${error.message}` : String(error);
      fail(label, `expected ApiError 404, got ${detail}`);
    }
  }
}

function stickerIdsOf(contact: ContactView | null): string[] {
  return contact ? contact.stickers.map((sticker) => sticker.id) : [];
}

function hasExactStickers(contact: ContactView | null, expected: string[]): boolean {
  const actual = [...stickerIdsOf(contact)].sort();
  return actual.join(",") === [...expected].sort().join(",");
}

async function main() {
  const stamp = Date.now();
  let userAId: string | undefined;
  let userBId: string | undefined;

  try {
    const userA = await prisma.user.create({
      data: { email: `test-sticker-${stamp}-a@example.test`, passwordHash: "x" },
    });
    userAId = userA.id;

    const userB = await prisma.user.create({
      data: { email: `test-sticker-${stamp}-b@example.test`, passwordHash: "x" },
    });
    userBId = userB.id;

    const stickerA = await prisma.sticker.create({
      data: { userId: userA.id, name: `Sticker A ${stamp}`, color: "red" },
    });
    const stickerB = await prisma.sticker.create({
      data: { userId: userB.id, name: `Sticker B ${stamp}`, color: "sky" },
    });

    const contactA = await createContactForUser(
      userA.id,
      contactCreateSchema.parse({ name: "Contact A", stickerIds: [stickerA.id] }),
    );
    const contactB = await createContactForUser(
      userB.id,
      contactCreateSchema.parse({ name: "Contact B", stickerIds: [stickerB.id] }),
    );

    // 2. B cannot assign A's sticker to B's contact.
    await expectNotFound("B cannot assign A's sticker to B's contact", () =>
      updateContactForUser(userB.id, contactB.id, { stickerIds: [stickerA.id] }),
    );

    const bAfterForeignPatch = await getContactForUser(userB.id, contactB.id);
    check(
      "B's contact keeps only B's sticker after the foreign PATCH",
      hasExactStickers(bAfterForeignPatch, [stickerB.id]),
      `stickers=${JSON.stringify(stickerIdsOf(bAfterForeignPatch))}`,
    );

    // 3. Mixed array is rejected without partial save.
    await expectNotFound("B cannot PATCH a mixed [own, foreign] sticker array", () =>
      updateContactForUser(userB.id, contactB.id, {
        stickerIds: [stickerB.id, stickerA.id],
      }),
    );

    const bAfterMixedPatch = await getContactForUser(userB.id, contactB.id);
    check(
      "B's contact is unchanged after the mixed PATCH",
      hasExactStickers(bAfterMixedPatch, [stickerB.id]),
      `stickers=${JSON.stringify(stickerIdsOf(bAfterMixedPatch))}`,
    );

    // 4. B cannot create contacts with A's sticker, alone or mixed.
    const bContactCountBefore = await prisma.contact.count({ where: { userId: userB.id } });

    await expectNotFound("B cannot create a contact with A's sticker", () =>
      createContactForUser(
        userB.id,
        contactCreateSchema.parse({ name: "Foreign sticker contact", stickerIds: [stickerA.id] }),
      ),
    );
    await expectNotFound("B cannot create a contact with a mixed sticker array", () =>
      createContactForUser(
        userB.id,
        contactCreateSchema.parse({
          name: "Mixed sticker contact",
          stickerIds: [stickerB.id, stickerA.id],
        }),
      ),
    );

    const bContactCountAfter = await prisma.contact.count({ where: { userId: userB.id } });
    check(
      "B's contact count is unchanged after rejected creates",
      bContactCountAfter === bContactCountBefore,
      `before=${bContactCountBefore} after=${bContactCountAfter}`,
    );

    // 5. B cannot read A's contact.
    const foreignContact = await getContactForUser(userB.id, contactA.id);
    check(
      "B cannot read A's contact",
      foreignContact === null,
      `got ${foreignContact ? foreignContact.id : "null"}`,
    );

    // 6. Filters are tenant-scoped.
    const filteredByForeignSticker = await prisma.contact.findMany({
      where: await buildContactWhere(userB.id, { stickers: [stickerA.id] }),
    });
    check(
      "B filtering by A's sticker never returns A's contact",
      filteredByForeignSticker.every((contact) => contact.id !== contactA.id),
      `ids=${JSON.stringify(filteredByForeignSticker.map((contact) => contact.id))}`,
    );

    const filteredByMixedStickers = await prisma.contact.findMany({
      where: await buildContactWhere(userB.id, {
        stickers: [stickerA.id, stickerB.id],
      }),
    });
    check(
      "B filtering by a mixed sticker array returns only B's contact",
      filteredByMixedStickers.length === 1 && filteredByMixedStickers[0]?.id === contactB.id,
      `ids=${JSON.stringify(filteredByMixedStickers.map((contact) => contact.id))}`,
    );
    check(
      "B filtering by a mixed sticker array never returns A's contact",
      filteredByMixedStickers.every((contact) => contact.id !== contactA.id),
      `ids=${JSON.stringify(filteredByMixedStickers.map((contact) => contact.id))}`,
    );

    // 7. Positive controls.
    const filteredByOwnStickerA = await prisma.contact.findMany({
      where: await buildContactWhere(userA.id, { stickers: [stickerA.id] }),
    });
    check(
      "A filtering by A's own sticker finds A's contact",
      filteredByOwnStickerA.some((contact) => contact.id === contactA.id),
      `ids=${JSON.stringify(filteredByOwnStickerA.map((contact) => contact.id))}`,
    );

    const filteredByOwnStickerB = await prisma.contact.findMany({
      where: await buildContactWhere(userB.id, { stickers: [stickerB.id] }),
    });
    check(
      "B filtering by B's own sticker finds B's contact",
      filteredByOwnStickerB.some((contact) => contact.id === contactB.id),
      `ids=${JSON.stringify(filteredByOwnStickerB.map((contact) => contact.id))}`,
    );
  } finally {
    const ids = [userAId, userBId].filter((id): id is string => Boolean(id));

    if (ids.length > 0) {
      await prisma.user.deleteMany({ where: { id: { in: ids } } });
    }

    await prisma.$disconnect();
  }
}

main()
  .then(() => {
    if (failures > 0) {
      console.error(`\n${failures} check(s) failed.`);
      process.exitCode = 1;
    } else {
      console.log("\nAll sticker isolation checks passed.");
    }
  })
  .catch((error) => {
    console.error("Isolation test crashed:", error);
    process.exitCode = 1;
  });
