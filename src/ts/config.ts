export default {
    data: {
        trailsServiceUrl: "http://services.arcgis.com/aA3snZwJfFkVyDuP/ArcGIS/rest/services/Vision2BActive_USFS_Trails/FeatureServer/0",
        trailAttributes: {
            name: "NAME",
            id: "ID",
            trail_class: "TRAIL_CLASS",
            length_miles: "Length_Miles",
            steps_to_travel: "Steps_to_Travel"
        }
    },
    colors: {
        defaultTrail: {
            path: "#E83A2B",
            halo: "#7D0000"
        },
        selectedTrail: {
            path: "#D2A002",
            halo: "#7A5100"
        }
    }
};
