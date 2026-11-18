import { Card, CardContent } from "@/components/ui/card";

type StatsCardsProps = {
  totalContacts: number;
  favoriteCount: number;
};

export function StatsCards({ totalContacts, favoriteCount }: StatsCardsProps) {
  const stats = [
    { label: "Total de contactos", value: totalContacts },
    { label: "Contactos favoritos", value: favoriteCount },
  ];

  return (
    <section aria-label="Estadísticas de contactos" className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="py-5">
            <p className="text-sm font-medium text-slate-600">{stat.label}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{stat.value}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
