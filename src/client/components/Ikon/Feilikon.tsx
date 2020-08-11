import React from 'react';
import Ikon from './Ikon';

interface FeilikonProps extends React.ComponentProps<any> {
    width?: number;
    height?: number;
    viewBox?: number;
}

const Feilikon = ({ width = 24, height = 24, viewBox = 25, className }: FeilikonProps) => (
    <Ikon width={width} height={height} viewBoxSize={viewBox} className={className}>
        <path
            d="M11.999 0C5.395 0 .013 5.372 0 11.976a11.923 11.923 0 0 0 3.498 8.493A11.925 11.925 0 0 0 11.977 24H12c6.603 0 11.986-5.373 12-11.978C24.013 5.406 18.64.012 11.999 0z"
            fillRule="nonzero"
            fill="#A13A28"
        />
        <path
            d="M12 10.651l3.372-3.372a.954.954 0 1 1 1.349 1.35L13.349 12l3.372 3.372a.954.954 0 1 1-1.35 1.349L12 13.349 8.628 16.72a.954.954 0 1 1-1.349-1.35L10.651 12 7.28 8.628A.954.954 0 1 1 8.63 7.28L12 10.651z"
            fillRule="nonzero"
            fill="#FFF"
        />
    </Ikon>
);

export default Feilikon;
