import React from 'react';
import { Ikon, IkonProps } from './Ikon';

export const Sykmeldingsperiodeikon = ({ width = 14, height = 14, className }: IkonProps) => (
    <Ikon width={width} height={height} viewBox="0 0 14 14" className={className}>
        <g fill="none">
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M14 12.8333C14 13.4777 13.4777 14 12.8333 14H1.16667C0.522334 14 0 13.4777 0 12.8333V2.91667C0 2.27233 0.522334 1.75 1.16667 1.75H3.5V0.583333C3.5 0.261167 3.76117 0 4.08333 0C4.38249 0 4.62905 0.22519 4.66274 0.515304L4.66667 0.583333V1.75H9.33275L9.33333 0.583333C9.33333 0.261167 9.5945 0 9.91667 0C10.2158 0 10.4624 0.22519 10.4961 0.515304L10.5 0.583333L10.4994 1.75H12.8333C13.4777 1.75 14 2.27233 14 2.91667V12.8333ZM12.8333 7H1.16667V12.8333H12.8333V7ZM3.5 2.91667H1.16667V5.83333H12.8333V2.91667H10.4994L10.5 4.08333C10.5 4.4055 10.2388 4.66667 9.91667 4.66667C9.61751 4.66667 9.37096 4.44148 9.33726 4.15136L9.33333 4.08333L9.33275 2.91667H4.66667V4.08333C4.66667 4.4055 4.4055 4.66667 4.08333 4.66667C3.78418 4.66667 3.53762 4.44148 3.50392 4.15136L3.5 4.08333V2.91667Z"
                fill="var(--navds-color-text-primary)"
            />
        </g>
    </Ikon>
);
