import config from "../config";
import * as UniqueValueRenderer from "esri/renderers/UniqueValueRenderer";
import * as LineSymbol3D from "esri/symbols/LineSymbol3D";
import * as LineSymbol3DLayer from "esri/symbols/LineSymbol3DLayer";
import * as LabelSymbol3D from "esri/symbols/LabelSymbol3D";
import * as LabelClass from "esri/layers/support/LabelClass";
import * as TextSymbol3DLayer from "esri/symbols/TextSymbol3DLayer";

export function getTrailRenderer(): UniqueValueRenderer {
    // Symbolizes groups of graphics that have matching attributes.
    return new UniqueValueRenderer({
        // Attribute field the renderer uses to match unique values or types.
        field: config.data.trailAttributes.id,
        // Default symbol used to draw a feature whose value is not matched or specified by the renderer.
        defaultSymbol: createTrailSymbol({
            selection: null
        }),
        // no unique values associated with the renderer.
        uniqueValueInfos: []
    });
}

// Creats symbols for trails when they are selected or not
function createTrailSymbol(options) {
    // Default color for symbols use in the layer.
    const color = options.selection ? config.colors.selectedTrail : config.colors.defaultTrail;
    // Default size for symbols use in the layer.
    const size = options.selection ? 4 : 2;

    return new LineSymbol3D({
        symbolLayers: [
            new LineSymbol3DLayer({
                material: {
                    color: color
                },
                size: size
            })
        ]
    });
}

export function getUniqueValueInfos(options) {
    if (options.selection) {
        return [{
            value: options.selection,
            symbol: createTrailSymbol(options)
        }];
    }
}

// Sets Labeling.
export function getLabelingInfo(options) {
    if (options.selection) {
        return [
            createLabelClass(options),
            createLabelClass({})
        ];
    }
    else {
        return [
            createLabelClass({})
        ];
    }
}

export function createLabelClass(options) {
    // Label color.
    const color = (options.selection) ? config.colors.selectedTrail : config.colors.defaultTrail;

    // Expressions, symbols, scale ranges, label priorities, and label placement within layer.
    const labelClass = new LabelClass({
        // Symbol used for rendering the label.
        symbol: new LabelSymbol3D({ // 3D Labels
            symbolLayers: [new TextSymbol3DLayer({ // 3D Labels
                material: {
                    color: "white"
                },
                // halo surrounds the text.
                halo: {
                    color: color,
                    size: 1
                },
                font: {
                    family: "Open Sans Condensed",
                    weight: "bold"
                },
                size: 13
            })],
            verticalOffset: {
                screenLength: 80, // The vertical symbol offset in points
                maxWorldLength: 2000, // maximum vertical offset
                minWorldLength: 500 // minimum verticle offset
            },
            // Line collout properties
            callout: {
                type: "line",
                size: 1,
                color: "white",
                border: {
                    color: color
                }
            }
        }),
        // The position of the label
        labelPlacement: "above-center",
        // Uses name of trail as label
        labelExpressionInfo: {
            expression: `$feature.${config.data.trailAttributes.name}`
        }
    });

    if (options.selection) {
        labelClass.where = `${config.data.trailAttributes.id} = ${options.selection}`;
    }

    return labelClass;
}
