import {className} from '../react'
import {createElement, useEffect, useMemo, useState} from 'react'
import {ExampleIcon as Icon} from '../icons/example'
import {Input} from '../widgets/input'
import {rgbFromHexString, rgbToHexString, hslFromRgb, rgbFromHsl} from '@eviljs/std-lib/color'

import './theme-view.css'

export function ThemeView(props: ThemeViewProps) {
    const [accent1RgbHex, setAccent1RgbHex] = useState('')
    const [accent2RgbHex, setAccent2RgbHex] = useState('')
    const [input, setInput] = useState('')
    const [themeLight, setThemeLight] = useState(true)

    useEffect(() => {
        const accent1RgbHex = computeAccent()
        const accent2RgbHex = computeAccent('secondary')

        setAccent1RgbHex(accent1RgbHex)
        setAccent2RgbHex(accent2RgbHex)
    }, [])

    const accentsHsl = useMemo(() => {
        if (! accent1RgbHex || ! accent2RgbHex ) {
            return
        }
        const rgb1 = rgbFromHexString(accent1RgbHex)
        const hsl1 = hslFromRgb(...rgb1)
        const rgb2 = rgbFromHexString(accent2RgbHex)
        const hsl2 = hslFromRgb(...rgb2)
        return [hsl1, hsl2] as const
    }, [accent1RgbHex, accent2RgbHex])

    return (
        <div
            {...props}
            {...className('theme-t2eb5b std-theme', props.className, {
                'light': themeLight, 'dark': ! themeLight,
            })}
        >
            <h1 className="std-stack-h std-text-overline std-primary-accent">
                <input
                    className="picker-t8c25d"
                    type="color"
                    value={accent1RgbHex}
                    onChange={(event) => setAccent1RgbHex(event.target.value)}
                />
                <i className="std-space-m"/>
                <label>Theme</label>
                <i className="std-space-m"/>
                <input
                    className="picker-t8c25d"
                    type="color"
                    value={accent2RgbHex}
                    onChange={(event) => setAccent2RgbHex(event.target.value)}
                />

                <i className="std-space-m"/>

                <i
                    {...className(['std-toggle', {active: themeLight}])}
                    onClick={() => setThemeLight(state => ! state)}
                />
            </h1>
            <style>{accentsHsl && `
                :root,
                .std-theme {
                    --std-primary-h: ${accentsHsl[0][0] * 360};
                    --std-primary-s: ${accentsHsl[0][1] * 100}%;
                    --std-primary-l: ${accentsHsl[0][2] * 100}%;
                    --std-secondary-h: ${accentsHsl[1][0] * 360};
                    --std-secondary-s: ${accentsHsl[1][1] * 100}%;
                    --std-secondary-l: ${accentsHsl[1][2] * 100}%;
                }
            `}</style>

            <i className="std-space-m"/>

            <div className="std-stack-h">
                <div className="std-stack-v">
                    <div className="std-stack-h" style={{alignItems: 'flex-end'}}>
                        <div className="std-stack-v" style={{alignItems: 'flex-start'}}>
                            <label className="text-bead07 std-text-display1">Display 1</label>
                            <label className="text-bead07 std-text-h1">Headline 1</label>
                            <label className="text-bead07 std-text-h2">Headline 2</label>
                            <label className="text-bead07 std-text-h3">Headline 3</label>
                            <label className="text-bead07 std-text-h4">Headline 4</label>
                            <label className="text-bead07 std-text-h5">Headline 5</label>
                            <label className="text-bead07 std-text-h6">Headline 6</label>
                            <label className="text-bead07 std-text-subtitle1">Subtitle 1</label>
                            <label className="text-bead07 std-text-subtitle2">Subtitle 2</label>
                            <label className="text-bead07 std-text-body1">Body 1</label>
                            <label className="text-bead07 std-text-body2">Body 2</label>
                            <label className="text-bead07 std-text-caption">Caption</label>
                            <label className="text-bead07 std-text-overline">Overline</label>
                            <label className="text-bead07 std-text-button">Button</label>
                        </div>

                        <div className="std-stack-v" style={{alignItems: 'flex-end'}}>
                            <div className="gutter-t1d3c1 important std-space-mini"><label>Mini</label></div>
                            <div className="gutter-t1d3c1 important std-space-xxs"><label>XXS</label></div>
                            <div className="gutter-t1d3c1 important std-space-xs"><label>XS</label></div>
                            <div className="gutter-t1d3c1 important std-space-s"><label>S</label></div>
                            <div className="gutter-t1d3c1 important std-space-m"><label>M</label></div>
                            <div className="gutter-t1d3c1 important std-space-l"><label>L</label></div>
                            <div className="gutter-t1d3c1 important std-space-xl"><label>XL</label></div>
                            <div className="gutter-t1d3c1 important std-space-xxl"><label>XXL</label></div>
                            <div className="gutter-t1d3c1 important std-space-maxi"><label>Maxi</label></div>
                        </div>
                    </div>

                    <i className="std-space-m"/>
                    <i className="std-space-m"/>

                    <div className="std-stack-h">
                        <label className="contrast-td0891 std-text1 std-back1">
                            Text&nbsp;1<br/>
                            Back&nbsp;1
                        </label>
                        <label className="contrast-td0891 std-text2 std-back2" style={{transform: 'translateX(-15px)'}}>
                            Text&nbsp;2<br/>
                            Back&nbsp;2
                        </label>
                        <label className="contrast-td0891 std-text3 std-back3" style={{transform: 'translateX(-30px)'}}>
                            Text&nbsp;3<br/>
                            Back&nbsp;3
                        </label>
                        <label className="contrast-td0891 std-text3 std-back4" style={{transform: 'translateX(-45px)'}}>
                            Text&nbsp;3<br/>
                            Back&nbsp;4
                        </label>
                    </div>
                    <i className="std-space-m"/>
                    <div className="std-stack-h">
                        <label className="contrast-td0891 std-text3-inverse std-back4-inverse">
                            Text&nbsp;3<br/>
                            Back&nbsp;4<br/>
                            inverse
                        </label>
                        <label className="contrast-td0891 std-text3-inverse std-back3-inverse" style={{transform: 'translateX(-15px)'}}>
                            Text&nbsp;3<br/>
                            Back&nbsp;3<br/>
                            inverse
                        </label>
                        <label className="contrast-td0891 std-text2-inverse std-back2-inverse" style={{transform: 'translateX(-30px)'}}>
                            Text&nbsp;2<br/>
                            Back&nbsp;2<br/>
                            inverse
                        </label>
                        <label className="contrast-td0891 std-text1-inverse std-back1-inverse" style={{transform: 'translateX(-45px)'}}>
                            Text&nbsp;1<br/>
                            Back&nbsp;1<br/>
                            inverse
                        </label>
                    </div>
                    <i className="std-space-m"/>
                    <i className="std-space-m"/>
                </div>

                <i className="std-space-m"/>

                <div className="std-stack-v">
                    <div className="std-stack-h" style={{alignItems: 'flex-start'}}>
                        <div className="std-stack-v" style={{alignItems: 'flex-end'}}>
                            <div className="std-stack-h">
                                <label>Primary Accent</label>
                                <div className="std-spacer"></div>
                                <span
                                    className="color-t75a7b"
                                    title="Primary accent"
                                    style={{backgroundColor: 'var(--std-primary-accent)'}}
                                />
                            </div>
                            <div className="std-space-s"></div>
                            <div className="std-stack-h">
                                <label>Tints</label>
                                <div className="std-spacer"></div>
                                {Array(6).fill(null).map((_, idx) => (
                                    <span
                                        key={idx}
                                        className="color-t75a7b"
                                        title={`Primary tint ${6-idx}`}
                                        style={{backgroundColor: `var(--std-primary-tint${6-idx})`}}
                                    />
                                ))}
                            </div>
                            <div className="std-space-s"></div>
                            <div className="std-stack-h">
                                <label>Shades</label>
                                <div className="std-spacer"></div>
                                {Array(6).fill(null).map((_, idx) => (
                                    <span
                                        key={idx}
                                        className="color-t75a7b"
                                        title={`Primary shade ${6-idx}`}
                                        style={{backgroundColor: `var(--std-primary-shade${6-idx})`}}
                                    />
                                ))}
                            </div>
                            <div className="std-space-s"></div>
                            <div className="std-stack-h">
                                <label>Tones</label>
                                <div className="std-spacer"></div>
                                {Array(6).fill(null).map((_, idx) => (
                                    <span
                                        key={idx}
                                        className="color-t75a7b"
                                        title={`Primary tone ${6-idx}`}
                                        style={{backgroundColor: `var(--std-primary-tone${6-idx})`}}
                                    />
                                ))}
                            </div>

                            <i className="std-space-m"/>

                            <div className="std-stack-h">
                                <label>Secondary Accent</label>
                                <div className="std-spacer"></div>
                                <span
                                    className="color-t75a7b"
                                    title="Primary accent"
                                    style={{backgroundColor: 'var(--std-secondary-accent)'}}
                                />
                            </div>
                            <div className="std-space-s"></div>
                            <div className="std-stack-h">
                                <label>Tints</label>
                                <div className="std-spacer"></div>
                                {Array(6).fill(null).map((_, idx) => (
                                    <span
                                        key={idx}
                                        className="color-t75a7b"
                                        title={`Primary tint ${6-idx}`}
                                        style={{backgroundColor: `var(--std-secondary-tint${6-idx})`}}
                                    />
                                ))}
                            </div>
                            <div className="std-space-s"></div>
                            <div className="std-stack-h">
                                <label>Shades</label>
                                <div className="std-spacer"></div>
                                {Array(6).fill(null).map((_, idx) => (
                                    <span
                                        key={idx}
                                        className="color-t75a7b"
                                        title={`Primary shade ${6-idx}`}
                                        style={{backgroundColor: `var(--std-secondary-shade${6-idx})`}}
                                    />
                                ))}
                            </div>
                            <div className="std-space-s"></div>
                            <div className="std-stack-h">
                                <label>Tones</label>
                                <div className="std-spacer"></div>
                                {Array(6).fill(null).map((_, idx) => (
                                    <span
                                        key={idx}
                                        className="color-t75a7b"
                                        title={`Primary tone ${6-idx}`}
                                        style={{backgroundColor: `var(--std-secondary-tone${6-idx})`}}
                                    />
                                ))}
                            </div>
                            <i className="std-space-m"/>
                            <i className="std-space-m"/>
                        </div>

                        <i className="std-space-m"/>
                        <i className="std-space-m"/>

                        <div className="std-stack-v">
                            <div>
                                <button className="std-button std-text-button std-button-special">Special</button>
                                <button className="std-button std-text-button std-button-primary">Primary</button>
                                <button className="std-button std-text-button std-button-secondary">Secondary</button>
                                <button className="std-button std-text-button std-button-tertiary">Tertiary</button>
                                <button className="std-button std-text-button std-button-flat">Flat</button>
                                <button className="std-button std-text-button std-button-plain">Plain</button>
                            </div>
                            <div className="std-space-xs"></div>
                            <div>
                                <button className="std-button std-text-button std-button-special" disabled>Special</button>
                                <button className="std-button std-text-button std-button-primary" disabled>Primary</button>
                                <button className="std-button std-text-button std-button-secondary" disabled>Secondary</button>
                                <button className="std-button std-text-button std-button-tertiary" disabled>Tertiary</button>
                                <button className="std-button std-text-button std-button-flat" disabled>Flat</button>
                                <button className="std-button std-text-button std-button-plain" disabled>Plain</button>
                            </div>

                            <i className="std-space-m"/>
                            <i className="std-space-m"/>

                            <div className="std-stack-h">
                                <Input label="Email" value={input} onChange={setInput}/>
                                <i className="std-space-m"/>
                                <Input label="Password" type="password" value="123456789"/>
                            </div>

                            <i className="std-space-m"/>
                            <i className="std-space-m"/>

                            <div>
                                <label className="duration-t34796" style={{transitionDuration: 'var(--std-duration-slow)'}}>Slow</label>
                                <label className="duration-t34796" style={{transitionDuration: 'var(--std-duration-normal)'}}>Normal</label>
                                <label className="duration-t34796" style={{transitionDuration: 'var(--std-duration-fast)'}}>Fast</label>
                                <label className="duration-t34796" style={{transitionDuration: 'var(--std-duration-flash)'}}>Flash</label>
                            </div>

                            <i className="std-space-m"/>
                            <i className="std-space-m"/>

                            <div className="std-stack-h" style={{alignItems: 'flex-end'}}>
                                <div className="icon-e43c30">
                                    <Icon className="std-icon std-icon-maxi"/>
                                    <div className="std-space-s"></div>
                                    <label>Maxi</label>
                                </div>
                                <div className="icon-e43c30">
                                    <Icon className="std-icon std-icon-xxl"/>
                                    <div className="std-space-xs"></div>
                                    <label>XXL</label>
                                </div>
                                <div className="icon-e43c30">
                                    <Icon className="std-icon std-icon-xl"/>
                                    <div className="std-space-xs"></div>
                                    <label>XL</label>
                                </div>
                                <div className="icon-e43c30">
                                    <Icon className="std-icon std-icon-l"/>
                                    <div className="std-space-xs"></div>
                                    <label>L</label>
                                </div>
                                <div className="icon-e43c30">
                                    <Icon className="std-icon std-icon-m"/>
                                    <div className="std-space-xs"></div>
                                    <label>M</label>
                                </div>
                                <div className="icon-e43c30">
                                    <Icon className="std-icon std-icon-s"/>
                                    <div className="std-space-xs"></div>
                                    <label>S</label>
                                </div>
                                <div className="icon-e43c30">
                                    <Icon className="std-icon std-icon-xs"/>
                                    <div className="std-space-xs"></div>
                                    <label>XS</label>
                                </div>
                                <div className="icon-e43c30">
                                    <Icon className="std-icon std-icon-xxs"/>
                                    <div className="std-space-xs"></div>
                                    <label>XXS</label>
                                </div>
                                <div className="icon-e43c30">
                                    <Icon className="std-icon std-icon-mini"/>
                                    <div className="std-space-xs"></div>
                                    <label>Mini</label>
                                </div>
                            </div>

                            <i className="std-space-m"/>
                            <i className="std-space-m"/>

                            <div>
                                <label className="radius-tabc5e std-radius-maxi">Maxi</label>
                                <label className="radius-tabc5e std-radius-xl">XL</label>
                                <label className="radius-tabc5e std-radius-l">L</label>
                                <label className="radius-tabc5e std-radius-m">M</label>
                                <label className="radius-tabc5e std-radius-s">S</label>
                                <label className="radius-tabc5e std-radius-xs">XS</label>
                                <label className="radius-tabc5e std-radius-mini">Mini</label>
                            </div>

                            <i className="std-space-m"/>
                        </div>
                    </div>

                    <i className="std-space-m"/>

                    <div className="std-stack-h" style={{maxWidth: 'var(--std-viewport-m)'}}>
                        <label className="shadow-t9a257 std-shadow-soft">Soft</label>
                        {Array(12).fill(null).map((_, idx) => (
                            <label key={idx} className={`shadow-t9a257 std-shadow${idx}`}>{idx}</label>
                        ))}
                        {Array(25).fill(null).map((nil, idx) => idx).slice(12).map(idx => (
                            <label key={idx} className={`shadow-t9a257 std-shadow std-shadow${idx}`}>{idx}</label>
                        ))}
                    </div>

                    <i className="std-space-m"/>
                    <i className="std-space-m"/>
                </div>
            </div>
        </div>
    )
}

export function computeAccent(type = 'primary') {
    const el = document.body
    const hProp = window.getComputedStyle(el).getPropertyValue(`--std-${type}-h`)
    const sProp = window.getComputedStyle(el).getPropertyValue(`--std-${type}-s`)
    const lProp = window.getComputedStyle(el).getPropertyValue(`--std-${type}-l`)
    const h = Number(hProp) / 360
    const s = Number(sProp.replace('%', '')) / 100
    const l = Number(lProp.replace('%', '')) / 100
    const rgb = rgbFromHsl(h, s, l)
    const rgbHex = rgbToHexString(...rgb)
    return rgbHex
}

// Types ///////////////////////////////////////////////////////////////////////

export interface ThemeViewProps {
    className?: string
    [key: string]: unknown
}
