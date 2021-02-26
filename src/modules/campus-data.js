import SodexoData from './sodexo-data';
import FazerData from './fazer-data';

const campusList = [
  {name: 'Arabia', coords: {latitude: 60.2099184, longitude: 24.9067259}, restaurant: {name: 'compas-arabia', displayname: 'Compas Arabia', id: 0, type: ''}},
  {name: 'Karamalmi', coords: {latitude: 60.2238794, longitude: 24.758149}, restaurant: {name: 'fazer-karamalmi', displayname: 'Fazer Karamalmi', id: 270540, type: FazerData}},
  {name: 'Myllypuro', coords: {latitude: 60.2236145, longitude: 25.0783509}, restaurant: {name: 'sodexo-myllypuro', displayname: 'Sodexo Myllypuro', id: 158, type: SodexoData}},
  {name: 'Myyrmäki', coords: {latitude: 60.2586191, longitude: 24.8454723}, restaurant: {name: 'sodexo-myyrmaki', displayname: 'Sodexo Myyrmäki', id: 152, type: SodexoData}}
];

const CampusData = {campusList};
export default CampusData;
