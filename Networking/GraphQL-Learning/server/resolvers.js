const countriesData = [
    {
        countryId: "1",
        countryCode: "IN",
        countryName: "India"
    },
    {
        countryId: "2",
        countryCode: "US",
        countryName: "USA"
    }
];

const statesData = [
    {
        stateId: "101",
        stateCode: "AP",
        stateName: "Andhra Pradesh",
        countryId: "1"
    },
    {
        stateId: "102",
        stateCode: "TS",
        stateName: "Telangana",
        countryId: "1"
    },
    {
        stateId: "201",
        stateCode: "CA",
        stateName: "California",
        countryId: "2"
    }
];

const citiesData = [
    {
        cityId: "1001",
        cityCode: "VJA",
        cityName: "Vijayawada",
        stateId: "101"
    },
    {
        cityId: "1002",
        cityCode: "VSKP",
        cityName: "Visakhapatnam",
        stateId: "101"
    },
    {
        cityId: "1003",
        cityCode: "HYD",
        cityName: "Hyderabad",
        stateId: "102"
    },
    {
        cityId: "2001",
        cityCode: "LA",
        cityName: "Los Angeles",
        stateId: "201"
    }
];

const resolvers = {
    Query: {
        countries: () => {
            return countriesData;
        },
        states: () => {
            return statesData;
        },
        cities: () => {
            return citiesData;
        }
    },
    country: {
        states: (parent, args, context, info) => {
            return statesData.filter((d) => d.countryId === parent.countryId)
        }
    },
    state: {
        cities: (parent) => {
            return citiesData.filter((data) => data.stateId === parent.stateId)
        }
    },
    Mutation: {
        createCountry: (parent, args, context, info) => {
            if (!args.countryCode.trim()) {
                throw new Error("countryCode cannot be empty");
            }

            if (!args.countryName.trim()) {
                throw new Error("countryName cannot be empty");
            }
            let newCountry = { countryCode: args.countryCode, countryName: args.countryName, countryId: String(countriesData.length + 1) }
            countriesData.push(newCountry)
            return newCountry;
        }
    }
}
export default resolvers;