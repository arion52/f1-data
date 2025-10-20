import type { Driver, StintData } from "@/lib/openf1";
import { render, screen } from "@testing-library/react";
import { PitStrategyPanel } from "../RaceArchive";

describe("PitStrategyPanel", () => {
  const drivers: Driver[] = [
    {
      driver_number: 63,
      broadcast_name: "G RUSSELL",
      name_acronym: "RUS",
      team_name: "Mercedes",
      team_colour: "00D2BE",
    },
  ];

  const stints: StintData[] = [
    {
      driver_number: 63,
      stint_number: 1,
      compound: "SOFT",
      lap_start: 1,
      lap_end: 18,
      tyre_age_at_start: 0,
    },
    {
      driver_number: 63,
      stint_number: 2,
      compound: "MEDIUM",
      lap_start: 19,
      lap_end: 40,
      tyre_age_at_start: 0,
    },
  ];

  it("renders grouped stints for selected drivers", () => {
    render(
      <PitStrategyPanel
        stints={stints}
        drivers={drivers}
        driverFilter={[63]}
        isLoading={false}
      />
    );

    expect(screen.getByText(/G RUSSELL/)).toBeInTheDocument();
    expect(screen.getByText(/SOFT/)).toBeInTheDocument();
    expect(screen.getByText(/MEDIUM/)).toBeInTheDocument();
    expect(screen.getByText(/Laps 1 – 18/)).toBeInTheDocument();
  });
});
