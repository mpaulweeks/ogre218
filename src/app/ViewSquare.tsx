import React from 'react';
import { GridKey, NeutralSpace, OgreSquare } from '../lib';
import { getName } from './render';
import './styles.css';

export function ViewSquare(props: {
  isHover: boolean;
  gridKey: GridKey;
  square?: OgreSquare;
  onHover(): void;
}) {
  const style = {
    borderColor: props.isHover ? 'black' : 'grey',
  };
  const label = (
    (props.gridKey === NeutralSpace && 'GAME') ||
    (props.square && getName(props.square.unit)) ||
    '??'
  );
  return (
    <div
      className='ViewCard'
      style={style}
      onMouseEnter={props.onHover}
    >
      <div>{label}</div>
    </div>
  );
}
