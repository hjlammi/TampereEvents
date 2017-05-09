describe("annaTapahtumaAika", function() {

  it("returns null if the given time is in the past", function() {
    var tapahtuma = {
      times: [
        {start_datetime: Date.parse("2010-01-01T00:00:00")},
        {start_datetime: Date.parse("2015-01-01T00:00:00")},
        {start_datetime: Date.parse("2018-01-01T00:00:00")},
        {start_datetime: Date.parse("2020-01-01T00:00:00")}
      ]
    }

    expect(annaTapahtumaAika(tapahtuma, 1)).toBe(null);
  });

  it("returns the given time if it is in the future", function() {
    var tapahtuma = {
      times: [
        {start_datetime: Date.parse("2010-01-01T00:00:00")},
        {start_datetime: Date.parse("2015-01-01T00:00:00")},
        {start_datetime: Date.parse("2018-01-01T00:00:00")},
        {start_datetime: Date.parse("2020-01-01T00:00:00")}
      ]
    }

    expect(annaTapahtumaAika(tapahtuma, 2)).toEqual({start_datetime: Date.parse("2018-01-01T00:00:00")});
  });

});
