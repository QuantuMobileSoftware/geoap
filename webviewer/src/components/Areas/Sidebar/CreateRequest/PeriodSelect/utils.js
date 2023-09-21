export const SEASONS = {
  summer: 'summer',
  winter: 'winter'
};

export const SEASON_DATES = {
  [SEASONS.summer]: year => ({ start: new Date(year, 4, 1), end: new Date(year, 7, 31) }),
  [SEASONS.winter]: year => ({
    start: new Date(year, 10, 1),
    end: new Date(year + 1, 1, 28)
  })
};

export const WINTER_TEXT = year =>
  `Winter season - applies dates from November ${year} to February ${year + 1}`;

export const SUMMER_TEXT = year =>
  `Summer season - applies dates from May ${year} to August ${year}`;

export const getSeasonList = startYear => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const summerSeasonEnd = SEASON_DATES[SEASONS.summer](currentYear).end;
  const isSeasonFinish = currentDate.getTime() > summerSeasonEnd.getTime();
  const seasonList = [];

  for (let year = startYear; year <= currentYear; year++) {
    if (year === currentYear && !isSeasonFinish) return seasonList;

    seasonList.push({
      value: `${SEASONS.summer} ${year}`,
      name: `Summer ${year}`
    });

    if (year === currentYear) return seasonList;

    seasonList.push({
      value: `${SEASONS.winter} ${year}`,
      name: `Winter ${year} - ${year + 1}`
    });
  }

  return seasonList;
};

export const getYearList = startYear => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const yearList = [];

  for (let year = startYear; year <= currentYear; year++) {
    yearList.push({
      value: year,
      name: `${year}`
    });
  }

  return yearList;
};
