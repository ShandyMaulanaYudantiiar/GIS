L.mapbox.accessToken =
    "pk.eyJ1Ijoic2hhbmR5bXkiLCJhIjoiY2twZTBwNXgxMGhyMDMwbzhhMDZkZ3RjMCJ9.-WxJp2GJqZH_jKv04jjvyg";
var map = L.mapbox
    .map("map")
    .setView([37.8, -96], 4)
    .addLayer(L.mapbox.styleLayer("mapbox://styles/mapbox/streets-v11"));

var getDataJson = async function () {
    const url =
        "https://raw.githubusercontent.com/lulumalik/choropleth/master/public/us.json";
    const res = await fetch(url);
    const data = await res.json();

    L.geoJson(data, {
        style: getStyle,
        onEachFeature: onEachFeature,
    }).addTo(map);
};

getDataJson();

function getStyle(feature) {
    return {
        weight: 2,
        opacity: 0.2,
        color: "black",
        fillOpacity: 0.7,
        fillColor: getColor(feature.properties.density),
    };
}

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: "#666",
        dashArray: "",
        fillOpacity: 0.7,
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
}

function getColor(d) {
    return d > 1000
        ? "#800026"
        : d > 500
            ? "#BD0026"
            : d > 200
                ? "#E31A1C"
                : d > 100
                    ? "#FC4E2A"
                    : d > 50
                        ? "#FD8D3C"
                        : d > 20
                            ? "#FEB24C"
                            : d > 10
                                ? "#FED976"
                                : "#FFEDA0";
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: openDetail,
        mouseout: removeMark,
    });
}

function openDetail(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 3,
        opacity: 0.3,
        //         fillOpacity: 0.9
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }

    info.update(layer.feature.properties);
}

//remove mark style
function removeMark(e) {
    let lay = e.target;

    lay.setStyle({
        weight: 2,
        opacity: 0.2,
        color: "black",
        fillOpacity: 0.7,
    });

    info.update();
}

// custom card detail
var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create("div", "info"); // create a div with a class "info"
    this.update();
    return this._div;
};

// update control properties
info.update = function (property) {
    this._div.innerHTML =
        "<h4>US Population Density</h4>" +
        (property
            ? "<b>" +
            property.name +
            "</b><br />" +
            property.density +
            " people / mi<sup>2</sup>"
            : "");
};

info.addTo(map);

var legend = L.control({
    position: "bottomright",
});

legend.onAdd = function (map) {
    var div = L.DomUtil.create("div", "info legend"),
        grades = [0, 10, 20, 50, 100, 200, 500, 1000],
        labels = [];

    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' +
            getColor(grades[i] + 1) +
            '"></i> ' +
            grades[i] +
            (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
    }

    return div;
};

legend.addTo(map);

var arcgisOnline = L.esri.Geocoding.arcgisOnlineProvider();
L.esri.Geocoding.geosearch({
    providers: [
        arcgisOnline,
        L.esri.Geocoding.mapServiceProvider({
            label: "States and Counties",
            url: "https://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer",
            layers: [2, 3],
            searchFields: ["NAME", "STATE_NAME"],
        }),
    ],
}).addTo(map);
