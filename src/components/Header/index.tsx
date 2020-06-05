import React from 'react';

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = (props) => (
  <header>
    { props.title && <h1>{props.title}</h1> }
    {props.children}
  </header>
)

export default Header;