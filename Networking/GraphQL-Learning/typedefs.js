const typeDefs = `
    type country {
        countryCode : String,
        countryName : String,
        countryId   :  ID,
        states:[state]
    }

    type state {
        stateCode : String,
        stateName : String,
        stateId   :  ID,
        countryId : ID,
        cities :[city]
    }

    type city {
        cityCode : String,
        cityName : String,
        cityId   :  ID,
        stateId : String
    }

    type Query {
        countries :[country],
        states : [state],
        cities : [city]
    }
`;
export default typeDefs;