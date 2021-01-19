import React, { HTMLAttributes, useRef, useState } from 'react';
import classNames from 'classnames';
import styled from '@emotion/styled';
import { useInteractOutside } from '../hooks/useInteractOutside';
import { Button } from './Button';
import { NedChevron, OppChevron } from 'nav-frontend-chevron';

const Container = styled.span`
    position: relative;
`;

const Knapp = styled(Button)`
    display: flex;
    align-items: center;
    color: #0067c5;
    font-size: 100%;

    i {
        margin-left: 0.5rem;
    }
`;

const Liste = styled.ul`
    position: absolute;
    list-style: none;
    background: #ffffff;
    border-radius: 0.25rem;
    box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.3);
    min-width: 1rem;
    min-height: 1rem;
    z-index: 1000;
    padding: 0.5rem 0;
`;

interface DropdownProps extends HTMLAttributes<HTMLButtonElement> {
    onClick?: (event: React.MouseEvent) => void;
}

interface DropdownContextValue {
    lukk: () => void;
}

export const DropdownContext = React.createContext<DropdownContextValue>({
    lukk: () => {},
});

export const Dropdown: React.FC<DropdownProps> = ({ onClick, className, children }) => {
    const [ekspandert, setEkspandert] = useState(false);
    const containerRef = useRef<HTMLSpanElement>(null);

    useInteractOutside({
        ref: containerRef,
        active: ekspandert,
        onInteractOutside: () => setEkspandert(false),
    });

    const onClickWrapper = (event: React.MouseEvent) => {
        onClick?.(event);
        setEkspandert(!ekspandert);
    };

    const lukk = () => {
        setEkspandert(false);
    };

    return (
        <Container ref={containerRef}>
            <Knapp onClick={onClickWrapper} className={classNames(className)}>
                Velg {ekspandert ? <OppChevron /> : <NedChevron />}
            </Knapp>
            <DropdownContext.Provider value={{ lukk }}>
                {ekspandert && <Liste>{children}</Liste>}
            </DropdownContext.Provider>
        </Container>
    );
};
