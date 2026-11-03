import { useEffect, useState } from 'preact/hooks'
import { Check, Folder, MapPin, Pencil, RotateCcw, Ruler, Save, Spline, VectorSquare } from 'lucide-preact'
import { useLayers } from "../../context/LayersContext"
import { Header } from "./Header"
import { Observation } from "./Observation"
import { Content } from "./Content"
import { Footer } from "./Footer"
import { ColorPicker } from "./ColorPicker"
import { IconPicker } from "./IconPicker"
import { COORDINATE_FORMATS, ELEVATION_UNITS, elevationAt, formatCoordinates } from "./geo"
import { useMap } from "../../context/MapContext"
import { AREA_UNITS, LINE_LENGTH_UNITS, MeasureContent, PERIMETER_UNITS } from "./MeasureContent"

const PANEL_CLASS = "pointer-events-auto flex w-88 flex-col overflow-clip rounded-2xl bg-white shadow-lg"

function FolderPanel({ layer, editing }){
    const { saveLayer, editLayer, closePanel, draftRef } = useLayers()
    const [name, setName] = useState(layer.name)
    const [observation, setObservation] = useState(layer.observation)
    // El botón solo aparece si la carpeta aún no tiene observación al entrar a editar
    const [observationOpen, setObservationOpen] = useState(Boolean(layer.observation))

    const draft = { name, observation }
    draftRef.current = editing ? draft : null

    return(
        <div class={PANEL_CLASS}>
            <Header icon={Folder} name={name} editing={editing} onNameInput={setName} onClose={() => closePanel(draft)}/>
            <Observation
                editing={editing}
                open={observationOpen}
                value={observation}
                onOpen={() => setObservationOpen(true)}
                onInput={setObservation}
            />
            {!editing && <Content name="Capas incluidas" value={layer.children.length}/>}
            {editing
                ? <Footer icon={Save} label="Guardar" onClick={() => saveLayer(layer.id, draft)}/>
                : <Footer icon={Pencil} label="Editar" onClick={() => editLayer(layer.id)}/>}
        </div>
    )
}

// Línea o polígono. mode: 'draw' (trazando) · 'edit' · 'view'
// La línea muestra "Listo" desde el 2.º punto; el polígono pasa solo a edición con el 3.º
function ShapePanel({ layer, mode }){
    const { saveLayer, editLayer, finishLine, closePanel, setPreview, draftRef } = useLayers()
    const [name, setName] = useState(layer.name)
    const [observation, setObservation] = useState(layer.observation)
    const [color, setColor] = useState(layer.color)
    const [observationOpen, setObservationOpen] = useState(Boolean(layer.observation))

    // El mapa muestra el color elegido en vivo; al salir del panel se descarta la vista previa
    useEffect(() => () => setPreview(null), [])
    const pickColor = (value) => {
        setColor(value)
        setPreview({ layerId: layer.id, color: value })
    }

    const editing = mode === 'edit'
    const isLine = layer.type === 'line'
    const draft = { name, observation, color }
    draftRef.current = editing ? draft : null

    return(
        <div class={PANEL_CLASS}>
            <Header icon={isLine ? Spline : VectorSquare} name={name} editing={editing} onNameInput={setName} onClose={() => closePanel(draft)}/>
            {mode !== 'draw' && (
                <Observation
                    editing={editing}
                    open={observationOpen}
                    value={observation}
                    onOpen={() => setObservationOpen(true)}
                    onInput={setObservation}
                >
                    <ColorPicker value={color} onChange={pickColor}/>
                </Observation>
            )}
            {isLine && (mode !== 'draw' || layer.points.length >= 2) && (
                <MeasureContent name="Longitud" kind="length" units={LINE_LENGTH_UNITS} value={layer.length}/>
            )}
            {!isLine && mode !== 'draw' && (
                <>
                    <MeasureContent name="Área" kind="area" units={AREA_UNITS} value={layer.area}/>
                    <MeasureContent name="Perímetro" kind="length" units={PERIMETER_UNITS} value={layer.perimeter}/>
                </>
            )}
            {isLine && mode === 'draw' && layer.points.length >= 2 && <Footer variant="outline" icon={Check} label="Listo" onClick={finishLine}/>}
            {editing && <Footer icon={Save} label="Guardar" onClick={() => saveLayer(layer.id, draft)}/>}
            {mode === 'view' && <Footer icon={Pencil} label="Editar" onClick={() => editLayer(layer.id)}/>}
        </div>
    )
}

// Punto. mode: 'draw' (esperando el clic) · 'edit' · 'view'
// Ubicación y elevación se muestran al trazar y en la vista; la edición solo pide icono y observación
function PointPanel({ layer, mode }){
    const { saveLayer, editLayer, closePanel, setPreview, draftRef } = useLayers()
    const [name, setName] = useState(layer.name)
    const [observation, setObservation] = useState(layer.observation)
    const [icon, setIcon] = useState(layer.icon)
    const [observationOpen, setObservationOpen] = useState(Boolean(layer.observation))

    useEffect(() => () => setPreview(null), [])
    const pickIcon = (value) => {
        setIcon(value)
        setPreview({ layerId: layer.id, icon: value })
    }

    const editing = mode === 'edit'
    const draft = { name, observation, icon }
    draftRef.current = editing ? draft : null

    // Sin punto aún se muestra el centro del mapa, como referencia
    const { map } = useMap()
    const location = layer.points[0] ?? map?.getCenter() ?? { lng: 0, lat: 0 }

    return(
        <div class={PANEL_CLASS}>
            <Header icon={MapPin} name={name} editing={editing} onNameInput={setName} onClose={() => closePanel(draft)}/>
            {mode !== 'draw' && (
                <Observation
                    editing={editing}
                    open={observationOpen}
                    value={observation}
                    onOpen={() => setObservationOpen(true)}
                    onInput={setObservation}
                >
                    <IconPicker value={icon} onChange={pickIcon}/>
                </Observation>
            )}
            {!editing && (
                <>
                    <MeasureContent
                        name="Ubicación"
                        kind="coordinates"
                        units={COORDINATE_FORMATS}
                        render={(format) => formatCoordinates(location, format.id)}
                    />
                    <MeasureContent name="Elevación del suelo" kind="elevation" units={ELEVATION_UNITS} value={elevationAt(map, location)}/>
                </>
            )}
            {editing && <Footer icon={Save} label="Guardar" onClick={() => saveLayer(layer.id, draft)}/>}
            {mode === 'view' && <Footer icon={Pencil} label="Editar" onClick={() => editLayer(layer.id)}/>}
        </div>
    )
}

// Medición temporal: no se guarda ni tiene nombre editable; "Volver a medir" la reinicia y la X la descarta
function MeasurePanel({ measure }){
    const { startMeasure, restartMeasure } = useLayers()

    return(
        <div class={PANEL_CLASS}>
            <Header icon={Ruler} name="Medir línea" options={false} onClose={() => startMeasure(measure.type)}/>
            {measure.points.length >= 2 && (
                <>
                    <MeasureContent name="Longitud" kind="length" units={LINE_LENGTH_UNITS} value={measure.length}/>
                    <Footer icon={RotateCcw} label="Volver a medir" onClick={restartMeasure}/>
                </>
            )}
        </div>
    )
}

export function MapPanel(){
    const { panel, panelLayer, measure } = useLayers()

    if (measure) return <MeasurePanel measure={measure}/>
    if (!panel || !panelLayer) return null

    const key = `${panelLayer.id}-${panel.mode}`

    if (!panelLayer.points) return <FolderPanel key={key} layer={panelLayer} editing={panel.mode === 'edit'}/>

    return panelLayer.type === 'point'
        ? <PointPanel key={key} layer={panelLayer} mode={panel.mode}/>
        : <ShapePanel key={key} layer={panelLayer} mode={panel.mode}/>
}
