export const SEASONS = {
  summer: 'summer',
  winter: 'winter'
};

export const SEASON_DATES = {
  [SEASONS.summer]: year => ({ start: new Date(year, 5, 1), end: new Date(year, 7, 31) }),
  [SEASONS.winter]: year => ({
    start: new Date(year, 11, 1),
    end: new Date(year + 1, 1, 28)
  })
};

export const WINTER_TEXT = year =>
  `Winter season - applies dates from December ${year} to February ${year + 1}`;

export const SUMMER_TEXT = year =>
  `Summer season - applies dates from June ${year} to August ${year}`;

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
