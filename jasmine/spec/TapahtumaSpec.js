
describe("makeEvent", function() {

  it("returns only all the future occurrences of an event", function() {
    var apiEvent = {
        item_id: 123,
        title: "Lol",
        image: {src: "www.lol.jpg", title: "lol.jpg"},
        description: "Lol",
        contact_info: {city: "Lolcity", address: "Lolstreet 1", link: "www.lol.com"},
        single_datetime: false,
        times: [
          {start_datetime: Date.parse("2016-01-01T00:00:00"), end_datetime: Date.parse("2018-01-02T00:00:00")},
          {start_datetime: Date.parse("2017-01-01T00:00:00"), end_datetime: Date.parse("2018-01-02T00:00:00")},
          {start_datetime: Date.parse("2018-01-01T00:00:00"), end_datetime: Date.parse("2018-01-02T00:00:00")},
          {start_datetime: Date.parse("2018-01-01T00:00:00"), end_datetime: Date.parse("2018-01-02T00:00:00")},
        ]}

    var begins = Date.parse("2017-01-01T00:00:00");

    expect(makeEvent(apiEvent, begins)).toEqual({
      event_id: 123,
      title: "Lol",
      image: {src: "www.lol.jpg", title: "lol.jpg"},
      description: "Lol",
      contact_info: {city: "Lolcity", address: "Lolstreet 1", link: "www.lol.com"},
      occurrences: [
        {begins: Date.parse("2017-01-01T00:00:00"), ends: Date.parse("2018-01-02T00:00:00")},
        {begins: Date.parse("2018-01-01T00:00:00"), ends: Date.parse("2018-01-02T00:00:00")},
        {begins: Date.parse("2018-01-01T00:00:00"), ends: Date.parse("2018-01-02T00:00:00")}]
    });
  });

  it("returns one occurrence of a single event", function() {
    var apiEvent = {
        item_id: 123,
        title: "Lol",
        image: {src: "www.lol.jpg", title: "lol.jpg"},
        description: "Lol",
        contact_info: {city: "Lolcity", address: "Lolstreet 1", link: "www.lol.com"},
        single_datetime: true,
        start_datetime: Date.parse("2018-01-01T00:00:00"),
        end_datetime: Date.parse("2018-01-02T00:00:00")}

    expect(makeEvent(apiEvent)).toEqual({
      event_id: 123,
      title: "Lol",
      image: {src: "www.lol.jpg", title: "lol.jpg"},
      description: "Lol",
      contact_info: {city: "Lolcity", address: "Lolstreet 1", link: "www.lol.com"},
      occurrences: [{begins: Date.parse("2018-01-01T00:00:00"), ends: Date.parse("2018-01-02T00:00:00")}]
    });
  });
});

describe("isOccurrenceInThePast", function() {

  it("returns true when the occurrence begins in the past", function() {
    var occurrence = {
      begins: Date.parse("2017-01-01T00:00:00"),
      ends: Date.parse("2017-01-02T00:00:00")}

    var begins = Date.parse("2017-02-02T00:00:00");

    expect(isOccurrenceInThePast(occurrence, begins)).toBe(true);
  });

  it("returns false when the occurrence begins in the future", function() {
    var occurrence = {
      begins: Date.parse("2018-01-01T00:00:00"),
      ends: Date.parse("2018-01-02T00:00:00")}

    var begins = Date.parse("2017-01-01T00:00:00");

    expect(isOccurrenceInThePast(occurrence, begins)).toBe(false);
  });
});

describe("removePastOccurrences", function() {

  it("returns only the future occurrences of an event", function() {
    var occurrences = [
      {begins: Date.parse("2016-01-01T00:00:00"), ends: Date.parse("2018-01-02T00:00:00")},
      {begins: Date.parse("2017-01-01T00:00:00"), ends: Date.parse("2018-01-02T00:00:00")},
      {begins: Date.parse("2018-01-01T00:00:00"), ends: Date.parse("2018-01-02T00:00:00")}
    ]

    var begins = Date.parse("2017-01-01T00:00:00");

    expect(removePastOccurrences(occurrences, begins)).toEqual([
      {begins: Date.parse("2017-01-01T00:00:00"), ends: Date.parse("2018-01-02T00:00:00")},
      {begins: Date.parse("2018-01-01T00:00:00"), ends: Date.parse("2018-01-02T00:00:00")}]);
  });
});

describe("isEventInThePast", function() {

  it("returns true if event is in the past", function() {
    var event = {
      title: "Lol",
      occurrences : []
    }

    expect(isEventInThePast(event)).toBe(true);
  });

  it("returns false if event is in the future", function() {
    var event = {
      title: "Lol",
      occurrences : [{begins: Date.parse("2018-01-01T00:00:00"), ends: Date.parse("2018-01-02T00:00:00")}]
    }

    expect(isEventInThePast(event)).toBe(false);
  });
});

describe("makeEvents", function() {

  it("removes past events", function() {
    var begins = Date.parse("2017-11-11T00:00:00");
    var lastBegins = Date.parse("2018-11-11T00:00:00");
    var apiEvents = [{
      item_id: 123,
      title: "Lol",
      image: {src: "www.lol.jpg", title: "lol.jpg"},
      description: "Lol",
      contact_info: {city: "Lolcity", address: "Lolstreet 1", link: "www.lol.com"},
      times : [
        {start_datetime: Date.parse("2016-01-01T00:00:00"), end_datetime: Date.parse("2016-01-02T00:00:00")},
        {start_datetime: Date.parse("2017-01-01T00:00:00"), end_datetime: Date.parse("2017-01-02T00:00:00")},
        {start_datetime: Date.parse("2017-02-01T00:00:00"), end_datetime: Date.parse("2017-02-02T00:00:00")}]
    },
    {
      item_id: 456,
      title: "Apua",
      image: {src: "www.apua.jpg", title: "apua.jpg"},
      description: "Apua",
      contact_info: {city: "Apuacity", address: "Apuastreet 1", link: "www.apua.com"},
      times : [
        {start_datetime: Date.parse("2018-01-01T00:00:00"), end_datetime: Date.parse("2018-01-13T00:00:00")}]
    },
    {
      item_id: 789,
      title: "Foo",
      image: {src: "www.foo.jpg", title: "foo.jpg"},
      description: "Foo",
      contact_info: {city: "Foocity", address: "Foostreet 1", link: "www.foo.com"},
      times : [
        {start_datetime: Date.parse("2018-01-01T00:00:00"), end_datetime: Date.parse("2018-01-02T00:00:00")},
        {start_datetime: Date.parse("2019-01-01T00:00:00"), end_datetime: Date.parse("2019-01-02T00:00:00")},
        {start_datetime: Date.parse("2020-01-01T00:00:00"), end_datetime: Date.parse("2020-01-02T00:00:00")}]
    }]
    expect(makeEvents(apiEvents, begins, lastBegins)).toEqual([{
      event_id: 456,
      title: "Apua",
      image: {src: "www.apua.jpg", title: "apua.jpg"},
      description: "Apua",
      contact_info: {city: "Apuacity", address: "Apuastreet 1", link: "www.apua.com"},
      occurrences : [
        {begins: Date.parse("2018-01-01T00:00:00"), ends: Date.parse("2018-01-13T00:00:00")}]
    },
    {
      event_id: 789,
      title: "Foo",
      image: {src: "www.foo.jpg", title: "foo.jpg"},
      description: "Foo",
      contact_info: {city: "Foocity", address: "Foostreet 1", link: "www.foo.com"},
      occurrences : [
        {begins: Date.parse("2018-01-01T00:00:00"), ends: Date.parse("2018-01-02T00:00:00")},
        {begins: Date.parse("2019-01-01T00:00:00"), ends: Date.parse("2019-01-02T00:00:00")},
        {begins: Date.parse("2020-01-01T00:00:00"), ends: Date.parse("2020-01-02T00:00:00")}]
    }
    ]);
  });

  it("sorts events by comparing the begins times of the first occurrences ", function() {
    var begins = Date.parse("2017-11-11T00:00:00");
    var lastBegins = Date.parse("2018-11-01T00:00:00");
    var apiEvents = [{
      title: "Lol",
      image: {src: "www.lol.jpg", title: "lol.jpg"},
      contact_info: {city: "Lolcity", address: "Lolstreet 1", link: "www.lol.com"},
      times : [
        {start_datetime: Date.parse("2016-01-01T00:00:00"), end_datetime: Date.parse("2016-01-02T00:00:00")},
        {start_datetime: Date.parse("2017-01-01T00:00:00"), end_datetime: Date.parse("2017-01-02T00:00:00")},
        {start_datetime: Date.parse("2018-11-01T00:00:00"), end_datetime: Date.parse("2018-12-02T00:00:00")}]
    },
      {
      title: "Apua",
      image: {src: "www.apua.jpg", title: "apua.jpg"},
      contact_info: {city: "Apuacity", address: "Apuastreet 1", link: "www.apua.com"},
      times : [
        {start_datetime: Date.parse("2016-01-01T00:00:00"), end_datetime: Date.parse("2018-01-02T00:00:00")},
        {start_datetime: Date.parse("2017-01-01T00:00:00"), end_datetime: Date.parse("2018-01-02T00:00:00")},
        {start_datetime: Date.parse("2018-01-01T00:00:00"), end_datetime: Date.parse("2018-01-02T00:00:00")}]
    },
    {
      title: "Foo",
      image: {src: "www.foo.jpg", title: "foo.jpg"},
      contact_info: {city: "Foocity", address: "Foostreet 1", link: "www.foo.com"},
      times : [
        {start_datetime: Date.parse("2019-01-01T00:00:00"), end_datetime: Date.parse("2019-01-02T00:00:00")},
        {start_datetime: Date.parse("2020-01-01T00:00:00"), end_datetime: Date.parse("2020-01-02T00:00:00")}]
    }]
    expect(Immutable.fromJS(makeEvents(apiEvents, begins, lastBegins)).map(function(t){
      return t.get("title");
    }).toJS()).toEqual(["Apua", "Lol"]);
  });
});

describe("isLastDateSameAsBeginsDate", function() {

  it("returns true if event begins in the same day that is the last day of the search", function() {
    var lastDate = Date.parse("2020-01-01T00:00:00");
    var event = {
      title: "Lol",
      occurrences : [{begins: Date.parse("2020-01-01T00:00:00"), ends: Date.parse("2020-01-11T00:00:00")}]
    }

    expect(isLastDateSameAsBeginsDate(event, lastDate)).toBe(true);
  });

  it("returns false if event begins in the same day that is the last day of the search", function() {
    var lastDate = Date.parse("2020-01-01T00:00:00");
    var event = {
      title: "Lol",
      occurrences : [{begins: Date.parse("2021-01-01T00:00:00"), ends: Date.parse("2021-01-11T00:00:00")}]
    }

    expect(isLastDateSameAsBeginsDate(event, lastDate)).toBe(false);
  });
});

describe("findEventWithId", function() {

  it("returns the event that has the id", function() {
    var events = [
      {
        event_id: 123,
        title: "Lol"
      },
      {
        event_id: 456,
        title: "Apua"
      },
      {
        event_id: 789,
        title: "Foo"
      }]
    var id = 789;
    expect(findEventWithId(id, events).title).toEqual("Foo");
  });

  it("returns the event that has the id", function() {
    var events = [
      {
        event_id: 123,
        title: "Lol"
      },
      {
        event_id: 456,
        title: "Apua"
      },
      {
        event_id: 789,
        title: "Foo"
      }]
    var id = 800;
    expect(findEventWithId(id, events)).toEqual(undefined);
  });
});

describe("findEventWithId", function() {

  it("returns the event that has the id", function() {
    var events = [
      {
        event_id: 123,
        title: "Lol"
      },
      {
        event_id: 456,
        title: "Apua"
      },
      {
        event_id: 789,
        title: "Foo"
      }]
    var id = 789;
    expect(findEventWithId(id, events).title).toEqual("Foo");
  });
});
