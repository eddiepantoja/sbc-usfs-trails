import config from "../config";
import * as Query from "esri/tasks/support/Query";
import * as QueryTask from "esri/tasks/QueryTask";

import Trail from "./Trail";

function queryTrails() {
    const query = new Query({
        outFields: ["*"],
        where: "ID=2000.21",
        returnGeometry: true,
        outSpatialReference: {
            wkid: 4326
        }
    });

    const queryTask = new QueryTask({
        url: config.data.trailsServiceUrl
    });

    return queryTask.execute(query);
}

const trailCart = {

    initTrails: (state) => {
        return queryTrails().then((result) => {
            state.trailCart = result.features.map((feature) => {
                return new Trail(feature, state);
            });
        })
            .catch((err) => {
                console.log(err);
            });
    }

};

export default trailCart;
