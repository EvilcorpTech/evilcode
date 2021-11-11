import {classes} from '@eviljs/react/react.js'
import {Fragment, useState} from 'react'
import {Accordion} from './accordion.js'
import {Button} from './button.js'
import {ArmoredButton} from './button-armored.js'
import {BusyButton} from './button-busy.js'
import {Checkbox} from './checkbox.js'
import {CheckboxMark as CheckboxMarkV1} from './checkbox-mark/shape.js'
import {CheckboxMark as CheckboxMarkV2} from './checkbox-mark/sign.js'
import {Input as InputV2, SecretInput as SecretInputV2, InputLabel as InputLabelV2} from './input/decorated.js'
import {Input as InputV1} from './input/floating.js'
import {RadioGroup} from './radio.js'
import {RangeNumeric, Range} from './range.js'
import {Slider, Slide} from './slider.js'
import {Spinner as SpinnerV1} from './spinner/v1.js'
import {Spinner as SpinnerV2} from './spinner/v2.js'
import {Spinner as SpinnerV3} from './spinner/v3.js'
import {Spinner as SpinnerV4} from './spinner/v4.js'
import {Switch} from './switch.js'
import {Tooltip} from './tooltip.js'

import './button-armored.css'
import './button-busy/replace.css'
import './button-busy/reveal.css'
import './input/decorated-theme.css'
import './input/floating-theme.css'
import './range/theme.css'

import './widgets-view.css'

export function WidgetsView(props: WidgetsViewProps) {
    const {className} = props
    const [busy, setBusy] = useState(false)
    const [checkbox, setCheckbox] = useState(false)
    const [input, setInput] = useState('')
    const [radio, setRadio] = useState('')
    const [range, setRange] = useState<Range<number>>({start: 50, end: 100})
    const [slide, setSlide] = useState(0)
    const [spinner, setSpinner] = useState(false)

    return (
        <div
            {...props}
            className={classes('WidgetsView-a252 std-flex center wrap', className)}
        >
            <div className="section-0234">
                <h6 className="title-74a6">Accordion</h6>

                <Accordion
                    header={(it, idx) => `${it.name}`}
                    items={[{name: 'Pizza'}, {name: 'Pasta'}, {name: 'Patate'}]}
                >
                    {(it) =>
                        <div className="std-viewport s std-text-body2 std-weight-light">
                            {Lorem}
                        </div>
                    }
                </Accordion>
            </div>

            <div className="section-0234 column">
                <h6 className="title-74a6">Buttons</h6>

                <Button className="dye">
                    Don't Click Me
                </Button>

                <BusyButton
                    className="reveal dye"
                    busy={busy}
                    spinner={<SpinnerV4 className="std-icon fluid"/>}
                    onClick={() => setBusy(! busy)}
                >
                    Reveal Busy Button
                </BusyButton>

                <BusyButton
                    className="replace dye"
                    busy={busy}
                    spinner={<SpinnerV4 className="std-icon fluid"/>}
                    onClick={() => setBusy(! busy)}
                >
                    Replace Busy Button
                </BusyButton>

                <ArmoredButton>
                    {({armor, close}) =>
                        <Fragment>
                            <Button
                                className="armor halo"
                                onClick={armor}
                            >
                                Armor
                            </Button>

                            <Button
                                className="cancel plain"
                                onClick={close}
                            >
                                Cancel
                            </Button>

                            <Button
                                className="confirm dye"
                                onClick={close}
                            >
                                Confirm
                            </Button>
                        </Fragment>
                    }
                </ArmoredButton>
            </div>

            <div className="section-0234 column">
                <h6 className="title-74a6">Controls</h6>

                <Switch className="std-text-subtitle1" checked={checkbox} onChange={setCheckbox}/>

                <Checkbox checked="mixed" disabled>
                    <CheckboxMarkV2 className="std-text-subtitle2"/>
                </Checkbox>
                <Checkbox checked={checkbox} onChange={setCheckbox}>
                    <CheckboxMarkV2 className="std-text-subtitle2"/>
                </Checkbox>

                <Checkbox checked={true} disabled>
                    <CheckboxMarkV1 className="std-icon xxs"/>
                </Checkbox>
                <Checkbox checked={checkbox} onChange={setCheckbox}>
                    <CheckboxMarkV1 className="std-icon xxs"/>
                </Checkbox>
                <Checkbox checked={checkbox} onChange={setCheckbox}>
                    <CheckboxMarkV1 className="round std-icon xxs"/>
                </Checkbox>

                <RadioGroup
                    items={[
                        {value: 'a', label: 'Apple'},
                        {value: 'b', label: 'Orange'},
                    ]}
                    selected={radio}
                    onChange={setRadio}
                />

                <RangeNumeric
                    min={0}
                    start={range.start}
                    end={range.end}
                    max={200}
                    onChanged={setRange}
                />
            </div>

            <div className="section-0234 column">
                <h6 className="title-74a6">Inputs</h6>

                <InputV1 placeholder="Placeholder..." value={input} onChange={setInput}/>
                <InputV1 label="Placeholder..." value={input} onChange={setInput}/>

                <InputV2 placeholder="Placeholder..." value={input} onChange={(event) => setInput(event.target.value)}/>
                <SecretInputV2 placeholder="Placeholder..." hideIcon="H" showIcon="S" defaultValue="123456789"/>
                <InputLabelV2 title="Label">
                    <InputV2 placeholder="Placeholder..." value={input} onChange={(event) => setInput(event.target.value)}/>
                </InputLabelV2>
            </div>

            <div className="section-0234">
                <h6 className="title-74a6">Slider</h6>

                <Button className="plain" onClick={(event) => setSlide(Math.max(0, slide - 1))}>
                    Prev.
                </Button>
                <Slider
                    selected={slide}
                    style={{
                        width: '400px',
                        height: '200px',
                        background: 'var(--std-color-bg3)',
                    }}
                >
                    <Slide className="std-stack h"><h6>1</h6></Slide>
                    <Slide className="std-stack h"><h6>2</h6></Slide>
                    <Slide className="std-stack h"><h6>3</h6></Slide>
                </Slider>
                <Button className="plain" onClick={(event) => setSlide(Math.min(2, slide + 1))}>
                    Next
                </Button>
            </div>

            <div className="section-0234">
                <h6 className="title-74a6">Spinners</h6>

                <Button className="plain" onClick={(event) => setSpinner(! spinner)}>
                    Toggle
                </Button>

                <SpinnerV1 active={spinner}/>
                <SpinnerV3 active={spinner}/>
                <SpinnerV4 active={spinner}/>
                <SpinnerV2 active={spinner}/>
            </div>

            <div className="section-0234">
                <h6 className="title-74a6">Tooltip</h6>

                <Tooltip content="Hello World!" position="right-center">
                    <Button className="flat">Right Center</Button>
                </Tooltip>
            </div>
        </div>
    )
}

export const Lorem = 'Lorem ipsum is simply dummy text of the printing and typesetting industry. Loren Ipsum has been the industries standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularized in the 1960s with the release of Letraset sheets containing Loren Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Loren Ipsum. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Loren Ipsum has been the industries standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularized in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.'

// Types ///////////////////////////////////////////////////////////////////////

export interface WidgetsViewProps extends React.HTMLAttributes<HTMLDivElement> {
}
