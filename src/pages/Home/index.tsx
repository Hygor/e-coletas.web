import React from 'react';
import { FiLogIn } from 'react-icons/fi';
import { Link } from 'react-router-dom';
 
import logo from '../../assets/logo.svg';
import './Home.css';

const Home: React.FC = (props) => {
  return (
    <div id="page-home">
      <div className="content">
        <header>
          <img src={logo} alt="e-coletas"/>
        </header>
        <main>
          <h1>Seu marketplace de coletas de resíduos.</h1>
          <p>Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente.</p>
          <Link to="/cadastro">
            <span><FiLogIn /></span>
            <strong>Cadastre um ponto de coletas</strong>
          </Link>
        </main>
      </div>
    </div>
  )
}

export default Home;