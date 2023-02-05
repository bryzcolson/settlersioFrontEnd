import React from 'react';

export class Box extends React.Component {
  constructor(props) {
    super(props);

    this.props = props;
  }

  render() {
    return (
      <mesh {...this.props}>
        <boxGeometry args={[1, 1, 1]}/>
        <meshStandardMaterial color='#f69f1f' metalness={0.5} roughness={0.7}/>
      </mesh>
    );
  }
}