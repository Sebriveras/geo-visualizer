import { useEffect, useRef, useState } from 'preact/hooks'
import { CircleGauge, Folder, MapPin, Pencil, RotateCcw, Ruler, Save, Spline, VectorSquare } from 'lucide-preact'
import { useLayers } from "../../context/LayersContext"
import { Header } from "./Header"
import { Observation } from "./Observation"
import { Content } from "./Content"
import { Footer } from "./Footer"
import { ColorPicker } from "./ColorPicker"
import { IconPicker } from "./IconPicker"
import { ImageCarousel, useImages } from "./ImageCarousel"
import { COORDINATE_FORMATS, ELEVATION_UNITS, elevationAt, formatCoordinates } from "./geo"
import { useCursorLocation, useMap } from "../../context/MapContext"
import { AREA_UNITS, LINE_LENGTH_UNITS, MeasureContent, PERIMETER_UNITS } from "./MeasureContent"

// Encabezado y pie fijos; solo el centro (BODY_CLASS) se desplaza cuando el panel no cabe en el mapa
const PANEL_CLASS = "pointer-events-auto flex max-h-full w-88 flex-col overflow-clip rounded-2xl bg-white shadow-lg"
const BODY_CLASS = "panel-scroll min-h-0 flex-1 overflow-y-auto"

// Enter equivale a pulsar "Guardar" mientras se edita. Se ignora en el campo de observación (Enter = salto de línea)
// y sobre botones y menús, donde Enter ya activa su propia acción
function useEnterToSave(enabled, onSave){
    const latest = useRef(onSave)
    latest.current = onSave

    useEffect(() => {
        if (!enabled) return

        const onKeyDown = (event) => {
            if (event.key !== 'Enter' || event.isComposing || event.defaultPrevented) return
            if (event.shiftKey || event.ctrlKey || event.metaKey || event.altKey) return
            if (event.target instanceof Element && event.target.closest('textarea, button, a, select, [role="menu"]')) return
            latest.current()
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [enabled])
}

function FolderPanel({ layer, editing }){
    const { saveLayer, editLayer, closePanel, draftRef } = useLayers()
    const [name, setName] = useState(layer.name)
    const [observation, setObservation] = useState(layer.observation)
    // El botón solo aparece si la carpeta aún no tiene observación al entrar a editar
    const [observationOpen, setObservationOpen] = useState(Boolean(layer.observation))

    const draft = { name, observation }
    draftRef.current = editing ? draft : null
    useEnterToSave(editing, () => saveLayer(layer.id, draft))

    return(
        <div class={PANEL_CLASS}>
            <Header icon={Folder} name={name} editing={editing} onNameInput={setName} onClose={() => closePanel(draft)}/>
            <div class={BODY_CLASS}>
                <Observation
                    editing={editing}
                    open={observationOpen}
                    value={observation}
                    onOpen={() => setObservationOpen(true)}
                    onInput={setObservation}
                />
                {!editing && <Content name="Capas incluidas" value={layer.children.length}/>}
            </div>
            {editing
                ? <Footer icon={Save} label="Guardar" onClick={() => saveLayer(layer.id, draft)}/>
                : <Footer icon={Pencil} label="Editar" onClick={() => editLayer(layer.id)}/>}
        </div>
    )
}

// Línea o polígono. mode: 'draw' (trazando) · 'edit' · 'view'
// Pasan solos a edición al tener los puntos mínimos: 2 la línea, 3 el polígono
function ShapePanel({ layer, mode }){
    const { saveLayer, editLayer, closePanel, setPreview, draftRef, undo, canUndo } = useLayers()
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
    const { images, error, input, openPicker, removeImage } = useImages(layer.images)
    const draft = { name, observation, color, images }
    draftRef.current = editing ? draft : null
    useEnterToSave(editing, () => saveLayer(layer.id, draft))

    return(
        <div class={PANEL_CLASS}>
            <Header icon={isLine ? Spline : VectorSquare} name={name} editing={editing} onNameInput={setName} onClose={() => closePanel(draft)} onUndo={mode !== 'view' ? undo : undefined} canUndo={canUndo}/>
            <div class={BODY_CLASS}>
                {mode !== 'draw' && (
                    <>
                        <ImageCarousel images={images} onAdd={editing ? openPicker : undefined} onRemove={editing ? removeImage : undefined}/>
                        {editing && error && <p class="px-4 pt-3 text-sm text-[#c10007]">{error}</p>}
                        <Observation
                            editing={editing}
                            open={observationOpen}
                            value={observation}
                            onOpen={() => setObservationOpen(true)}
                            onInput={setObservation}
                            onImage={images.length === 0 ? openPicker : undefined}
                        >
                            <ColorPicker value={color} onChange={pickColor}/>
                        </Observation>
                    </>
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
            </div>
            {input}
            {editing && <Footer icon={Save} label="Guardar" onClick={() => saveLayer(layer.id, draft)}/>}
            {mode === 'view' && <Footer icon={Pencil} label="Editar" onClick={() => editLayer(layer.id)}/>}
        </div>
    )
}

// Punto. mode: 'draw' (esperando el clic) · 'edit' · 'view'
// Ubicación y elevación se muestran siempre (al trazar siguen al cursor; al editar, al punto mientras se mueve)
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
    const { images, error, input, openPicker, removeImage } = useImages(layer.images)
    const draft = { name, observation, icon, images }
    draftRef.current = editing ? draft : null
    useEnterToSave(editing, () => saveLayer(layer.id, draft))

    // Sin punto aún, ubicación y elevación siguen al cursor al trazar (o son las del centro del mapa)
    const { map } = useMap()
    const cursor = useCursorLocation(mode === 'draw')
    const location = layer.points[0] ?? cursor ?? map?.getCenter() ?? { lng: 0, lat: 0 }

    return(
        <div class={PANEL_CLASS}>
            <Header icon={MapPin} name={name} editing={editing} options={!editing} onNameInput={setName} onClose={() => closePanel(draft)}/>
            <div class={BODY_CLASS}>
                {mode !== 'draw' && (
                    <>
                        <ImageCarousel images={images} onAdd={editing ? openPicker : undefined} onRemove={editing ? removeImage : undefined}/>
                        {editing && error && <p class="px-4 pt-3 text-sm text-[#c10007]">{error}</p>}
                        <Observation
                            editing={editing}
                            open={observationOpen}
                            value={observation}
                            onOpen={() => setObservationOpen(true)}
                            onInput={setObservation}
                            onImage={images.length === 0 ? openPicker : undefined}
                        >
                            <IconPicker value={icon} onChange={pickIcon}/>
                        </Observation>
                    </>
                )}
                <MeasureContent
                    name="Ubicación"
                    kind="coordinates"
                    units={COORDINATE_FORMATS}
                    render={(format) => formatCoordinates(location, format.id)}
                />
                <MeasureContent name="Elevación del suelo" kind="elevation" units={ELEVATION_UNITS} value={elevationAt(map, location)}/>
            </div>
            {input}
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
            <Header icon={measure.type === 'circle' ? CircleGauge : Ruler} name={measure.type === 'circle' ? 'Medir circunferencia' : 'Medir línea'} options={false} onClose={() => startMeasure(measure.type)}/>
            {measure.points.length >= 2 && (
                <>
                    <div class={BODY_CLASS}>
                        <MeasureContent name={measure.type === 'circle' ? 'Diámetro' : 'Longitud'} kind="length" units={LINE_LENGTH_UNITS} value={measure.length}/>
                    </div>
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
