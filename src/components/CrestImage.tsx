import React from 'react';
import { Image } from 'react-native';
import { crestFor } from '../assets';

type Props = {
  crestIndex: number;
  size: number;
};

/** Transparent crest PNG placed directly: aspect preserved, no rounded mask, no stretch. */
export function CrestImage({ crestIndex, size }: Props) {
  return (
    <Image
      source={crestFor(crestIndex)}
      style={{ width: size, height: size }}
      resizeMode="contain"
    />
  );
}
