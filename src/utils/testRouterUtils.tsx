import React from "react";
import { render } from "@testing-library/react";
import { useSearchParams, MemoryRouter } from "react-router";

const SearchParamsProbe = ({
  onParams,
}: {
  onParams: (params: URLSearchParams) => void;
}) => {
  const [params] = useSearchParams();
  onParams(params);
  return null;
};

export const renderWithRouter = (
  ui: React.ReactElement,
  initialEntry = "/"
) => {
  let latestParams = new URLSearchParams();
  const result = render(
    <MemoryRouter initialEntries={[initialEntry]}>
      {ui}
      <SearchParamsProbe
        onParams={(params) => {
          latestParams = params;
        }}
      />
    </MemoryRouter>
  );
  return {
    ...result,
    getParams: () => latestParams,
  };
};
