import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiChevronLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';
import logo from '../../assets/logo.svg';
import './CreatePoint.css';
import api from '../../services/api';
import axios from 'axios';
import { LeafletMouseEvent } from 'leaflet';

interface Item {
  id: number;
  title: string;
  image: string;
}

interface IBGEUFResponse {
  sigla: string;
}

interface IBGECityResponse {
  nome: string;
}

const CreatePoint = () => {

  const [items, setItems] = useState<Item[]>([]);
  const [uf, setUF] = useState<string[]>([]);
  const [city, setCity] = useState<string[]>([]);
  const [selectedUF, setSelectedUF] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [initialPosition, setInitialPosition] = useState<[number, number]>([0,0]);
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0,0]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [ formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
  })

  const history = useHistory();

  useEffect( () => {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      setInitialPosition([latitude, longitude]);
    })
  }, [])

  useEffect( () => {
    api.get('items').then( response => {
      setItems(response.data);
    });
  }, []);

  useEffect( () => {
    axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
      .then( response => {
        const ufInitials = response.data.map( uf => uf.sigla);
        setUF(ufInitials);
      });
  }, []);

  useEffect( () => {
    if ( selectedUF === '0') {
      return;
    }
    axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUF}/municipios`)
    .then( response => {
      const cityNames = response.data.map( cidade => cidade.nome);
      setCity(cityNames);
    });
  }, [selectedUF]);

  const handleSelectUF = (event: ChangeEvent<HTMLSelectElement>) => {
    const uf = event.target.value;
    setSelectedUF(uf);
  }

  const handleSelectCity = (event: ChangeEvent<HTMLSelectElement>) => {
    const city = event.target.value;
    setSelectedCity(city);
  }

  const handleMapClick = (event: LeafletMouseEvent) => {
    setSelectedPosition([
      event.latlng.lat,
      event.latlng.lng
    ])
  }
  
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({...formData, [name]: value })
  }

  const handleSelectItem = (id: number) => {
    const prevSelectedItem = selectedItems.findIndex( item => item === id);
    if ( prevSelectedItem >= 0) {
      const ItemsToChange = selectedItems.filter( item => item !== id );
      setSelectedItems(ItemsToChange);
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  }

  const handleFormSubmit = async (event: FormEvent) => {
    event.preventDefault();
    
    const {
      name,
      email,
      whatsapp
    } = formData;
    const uf = selectedUF;
    const city = selectedCity;
    const [latitude, longitude] = selectedPosition;
    const items = selectedItems;

    const data = {
      name,
      email,
      whatsapp,
      uf,
      city,
      lat: latitude,
      long: longitude,
      items
    }
    await api.post('points', data);
    alert('ponto de coleta criado');
    history.push('/');
  }

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="e-coletas"/>
        <Link to="/" title="voltar">
          <FiChevronLeft />
          Voltar para o início
        </Link>
      </header>
      
      <form onSubmit={handleFormSubmit}>
        <h1>Cadastro do <br />ponto de coleta</h1>

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>

          <div className="field">
            <label htmlFor="name">Nome do Local</label>
            <input type="text" name="name" id="name" onChange={handleInputChange} />
          </div>

          <div className="field-group">
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input type="text" name="email" id="email" onChange={handleInputChange} />
            </div>
            <div className="field">
              <label htmlFor="whatsapp">Whatsapp</label>
              <input type="text" name="whatsapp" id="whatsapp" onChange={handleInputChange} />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>

          <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={selectedPosition} />
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select
                name="uf"
                id="uf"
                value={selectedUF}
                onChange={handleSelectUF}>
                <option value="0">Selecione uma UF</option>
                { uf.map( uf => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select
                name="city"
                id="city"
                value={selectedCity}
                onChange={handleSelectCity}>
                <option value="0">Selecione uma UF</option>
                { city.map( city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Itens de Coleta</h2>
            <span>Selecion um ou mais itens de coleta</span>
          </legend>

          {items && (
            <ul className="items-grid">
              { items.map( item => {
                const { id, title, image } = item;
                return (
                  <li
                    className={ selectedItems.includes(id) ? 'selected' : ''}
                    key={id}
                    onClick={() => handleSelectItem(id)}>
                    <img src={image} alt={title} />
                    <span>{title}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </fieldset>

        <button type="submit">Cadastrar ponto de coleta</button>

      </form>
    </div>
  )
};

export default CreatePoint;