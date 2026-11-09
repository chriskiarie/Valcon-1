import FleetRow from "@/components/home/FleetRow";

export default function FleetPage({
  onCardClick,
}: {
  onCardClick?: (slug: string) => void;
}) {
  return (
    <div className="fleet-page">
      <h1 className="fleet-page-title">The fleet</h1>
      <FleetRow onCardClick={onCardClick} />
    </div>
  );
}