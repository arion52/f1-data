import { render, screen } from "@testing-library/react";
import { LiveLeaderboard } from "../LiveLeaderboard";

describe("LiveLeaderboard", () => {
  const rows = [
    {
      position: 1,
      driver: {
        driver_number: 1,
        broadcast_name: "M VERSTAPPEN",
        name_acronym: "VER",
        team_name: "Red Bull Racing",
        team_colour: "3671C6",
      },
      gapLabel: "--",
      intervalLabel: "--",
      compound: "SOFT",
      numberOfLaps: 15,
      status: undefined,
    },
    {
      position: 2,
      driver: {
        driver_number: 16,
        broadcast_name: "C LECLERC",
        name_acronym: "LEC",
        team_name: "Ferrari",
        team_colour: "DC0000",
      },
      gapLabel: "+2.315s",
      intervalLabel: "+1.201s",
      compound: "MEDIUM",
      numberOfLaps: 15,
      status: "DNF",
    },
  ];

  it("renders driver rows with tyre compounds", () => {
    render(<LiveLeaderboard rows={rows} isLoading={false} />);

    expect(screen.getByText(/M VERSTAPPEN/i)).toBeInTheDocument();
    expect(screen.getByText(/C LECLERC/i)).toBeInTheDocument();
    expect(screen.getByText(/\+2.315s/)).toBeInTheDocument();
    expect(screen.getByText(/SOFT/)).toBeInTheDocument();
    expect(screen.getByText(/MEDIUM/)).toBeInTheDocument();
  });

  it("shows loading badge when refreshing", () => {
    render(<LiveLeaderboard rows={rows} isLoading />);
    expect(screen.getByText(/Refreshing/i)).toBeInTheDocument();
  });
});
