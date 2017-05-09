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

describe("annaVainTulevatAjat", function() {

  it("returns future dates", function() {
    var tapahtuma = {
      times: [
        {
          start_datetime: Date.parse("2010-01-01T00:00:00"),
          end_datetime: Date.parse("2010-01-02T00:00:00")
        },
        {
          start_datetime: Date.parse("2015-01-01T00:00:00"),
          end_datetime: Date.parse("2015-01-02T00:00:00")
        },
        {
          start_datetime: Date.parse("2018-01-01T00:00:00"),
          end_datetime: Date.parse("2018-01-02T00:00:00")
        },
        {
          start_datetime: Date.parse("2020-01-01T00:00:00"),
          end_datetime: Date.parse("2020-01-02T00:00:00")
        }
      ]
    }

    expect(annaVainTulevatAjat(tapahtuma)).toEqual([
      {start_datetime: Date.parse("2018-01-01T00:00:00"), end_datetime: Date.parse("2018-01-02T00:00:00")},
      {start_datetime: Date.parse("2020-01-01T00:00:00"), end_datetime: Date.parse("2020-01-02T00:00:00")}]);
  });
});

describe("annaAlkuJaLoppuaika", function() {

  it("returns start and end times", function() {
    var tapahtuma = {
      start_datetime: Date.parse("2018-01-01T00:00:00"),
      end_datetime: Date.parse("2018-01-02T00:00:00")
    }

    expect(annaAlkuJaLoppuaika(tapahtuma)).toEqual({
      start_datetime: Date.parse("2018-01-01T00:00:00"),
      end_datetime: Date.parse("2018-01-02T00:00:00")});
  });

  it("returns null if start time is in the past", function() {
    var tapahtuma = {
      start_datetime: Date.parse("2010-01-01T00:00:00"),
      end_datetime: Date.parse("2010-01-02T00:00:00")
    }

    expect(annaAlkuJaLoppuaika(tapahtuma)).toBe(null);
  });
});

describe("annaMaxKolmeTapahtumaa", function() {

  it("returns an array of one object if there is only one object", function() {
    var ajat = [
      {
        start_datetime: Date.parse("2018-01-01T00:00:00"),
        end_datetime: Date.parse("2018-01-02T00:00:00")
      }
    ]

    expect(annaMaxKolmeTapahtumaa(ajat)).toEqual([{
      start_datetime: Date.parse("2018-01-01T00:00:00"),
      end_datetime: Date.parse("2018-01-02T00:00:00")}]);
  });

  it("returns an array of three objects if there are four objects", function() {
    var ajat = [
      {
        start_datetime: Date.parse("2018-01-01T00:00:00"),
        end_datetime: Date.parse("2018-01-02T00:00:00")
      },
      {
        start_datetime: Date.parse("2018-01-01T00:00:00"),
        end_datetime: Date.parse("2018-01-02T00:00:00")
      },
      {
        start_datetime: Date.parse("2018-01-01T00:00:00"),
        end_datetime: Date.parse("2018-01-02T00:00:00")
      },
      {
        start_datetime: Date.parse("2018-01-01T00:00:00"),
        end_datetime: Date.parse("2018-01-02T00:00:00")
      }
    ]

    expect(annaMaxKolmeTapahtumaa(ajat)).toEqual([
      {
        start_datetime: Date.parse("2018-01-01T00:00:00"),
        end_datetime: Date.parse("2018-01-02T00:00:00")
      },
      {
        start_datetime: Date.parse("2018-01-01T00:00:00"),
        end_datetime: Date.parse("2018-01-02T00:00:00")
      },
      {
        start_datetime: Date.parse("2018-01-01T00:00:00"),
        end_datetime: Date.parse("2018-01-02T00:00:00")
    }]);
  });
});

describe("lajitteleTapahtumat", function() {

  it("sorts three events by their start_datetime", function() {
    var data = [
      {
        title: "Lol",
        single_datetime: true,
        start_datetime: Date.parse("2018-01-01T00:00:00"),
        end_datetime: Date.parse("2018-01-02T00:00:00")
      },
      {
        title: "Apua",
        single_datetime: true,
        start_datetime: Date.parse("2017-07-01T00:00:00"),
        end_datetime: Date.parse("2017-07-02T00:00:00")
      },
      {
        title: "Foo",
        single_datetime: true,
        start_datetime: Date.parse("2017-11-01T00:00:00"),
        end_datetime: Date.parse("2017-11-02T00:00:00")
      }
    ]

    expect(Immutable.fromJS(lajitteleTapahtumat(data)).map(function(t){
      return t.get("title");
    }).toJS()).toEqual(["Apua", "Foo", "Lol"]);
  });

  it("sorts three events by their start_datetime of times array", function() {
    var data = [
      {
        title: "Lol",
        single_datetime: false,
        times: [{
          start_datetime: Date.parse("2017-07-01T00:00:00"), end_datetime: Date.parse("2017-07-02T00:00:00")
        },
        {
          start_datetime: Date.parse("2018-01-01T00:00:00"), end_datetime: Date.parse("2018-01-02T00:00:00")
        }]
      },
      {
        title: "Apua",
        single_datetime: false,
        times: [{
          start_datetime: Date.parse("2017-08-01T00:00:00"), end_datetime: Date.parse("2017-08-02T00:00:00")
        },
        {
          start_datetime: Date.parse("2017-08-05T00:00:00"), end_datetime: Date.parse("2017-08-06T00:00:00")
        }]
      },
      {
        title: "Foo",
        single_datetime: false,
        times: [ {
          start_datetime: Date.parse("2017-06-01T00:00:00"), end_datetime: Date.parse("2017-06-02T00:00:00")
        },
        {
          start_datetime: Date.parse("2017-06-10T00:00:00"), end_datetime: Date.parse("2017-06-11T00:00:00")
        }]
      }
    ]

    expect(Immutable.fromJS(lajitteleTapahtumat(data)).map(function(t){
      return t.get("title");
    }).toJS()).toEqual(["Foo", "Lol", "Apua"]);
  });

  it("sorts two events when the latter has only one event time", function() {
    var data = [
      {
        title: "Apua",
        single_datetime: false,
        times: [{
          start_datetime: Date.parse("2017-08-01T00:00:00"), end_datetime: Date.parse("2017-08-02T00:00:00")
        },
        {
          start_datetime: Date.parse("2017-08-05T00:00:00"), end_datetime: Date.parse("2017-08-06T00:00:00")
        }]
      },
      {
        title: "Foo",
        single_datetime: true,
        start_datetime: Date.parse("2017-06-01T00:00:00"), end_datetime: Date.parse("2017-06-02T00:00:00")
      }
    ]

    expect(Immutable.fromJS(lajitteleTapahtumat(data)).map(function(t) {
      return t.get("title");
    }).toJS()).toEqual(["Foo", "Apua"]);
  });
});

describe("makeEvent", function() {

  it("returns only all the occurrences of an event", function() {
    var apiEvent = {
        title: "Lol",
        single_datetime: false,
        times: [
          {start_datetime: Date.parse("2016-01-01T00:00:00"), end_datetime: Date.parse("2018-01-02T00:00:00")},
          {start_datetime: Date.parse("2017-01-01T00:00:00"), end_datetime: Date.parse("2018-01-02T00:00:00")},
          {start_datetime: Date.parse("2018-01-01T00:00:00"), end_datetime: Date.parse("2018-01-02T00:00:00")},
        ]}

    expect(makeEvent(apiEvent)).toEqual({
      title: "Lol",
      occurrences: [
        {begins: Date.parse("2018-01-01T00:00:00"), ends: Date.parse("2018-01-02T00:00:00")}]
    });
  });

  it("returns one occurrence of a single event", function() {
    var apiEvent = {
        title: "Lol",
        single_datetime: true,
        start_datetime: Date.parse("2018-01-01T00:00:00"),
        end_datetime: Date.parse("2018-01-02T00:00:00")}

    expect(makeEvent(apiEvent)).toEqual({
      title: "Lol",
      occurrences: [{begins: Date.parse("2018-01-01T00:00:00"), ends: Date.parse("2018-01-02T00:00:00")}]
    });
  });
});

describe("isOccurrenceInThePast", function() {

  it("returns true when the occurrence begins in the past", function() {
    var occurrence = {
      begins: Date.parse("2017-01-01T00:00:00"),
      ends: Date.parse("2017-01-02T00:00:00")}

    expect(isOccurrenceInThePast(occurrence)).toBe(true);
  });

  it("returns false when the occurrence begins in the future", function() {
    var occurrence = {
      begins: Date.parse("2018-01-01T00:00:00"),
      ends: Date.parse("2018-01-02T00:00:00")}

    expect(isOccurrenceInThePast(occurrence)).toBe(false);
  });
});

describe("removePastOccurrences", function() {

  it("returns only the future occurrences of an event", function() {
    var occurrences = [
      {begins: Date.parse("2016-01-01T00:00:00"), ends: Date.parse("2018-01-02T00:00:00")},
      {begins: Date.parse("2017-01-01T00:00:00"), ends: Date.parse("2018-01-02T00:00:00")},
      {begins: Date.parse("2018-01-01T00:00:00"), ends: Date.parse("2018-01-02T00:00:00")},
    ]

    expect(removePastOccurrences(occurrences)).toEqual([
        {begins: Date.parse("2018-01-01T00:00:00"), ends: Date.parse("2018-01-02T00:00:00")}]);
  });
});
