import React, { useState, useEffect } from 'react';

const LocationSelector = ({ setWorkplaceSido, setWorkplaceSigoon, setWorkplaceDong }) => {
  const [provinces, setProvinces] = useState([]); // 전국 8도 리스트
  const [cities, setCities] = useState([]); // 선택한 도의 시군구 리스트
  const [towns, setTowns] = useState([]); // 선택한 시군구의 읍면동 리스트
  const [selectedProvince, setSelectedProvince] = useState(null); // 선택한 도
  const [selectedCity, setSelectedCity] = useState(null); // 선택한 시군구
  const [selectedTown, setSelectedTown] = useState(null); // 선택한 읍면동

  const apiKey= process.env.REACT_APP_KEY_API
  const port = process.env.REACT_APP_ADDRESS_API;

  // 1. 전국 8도 리스트 요청
  useEffect(() => {
    fetch(`/api/req/data?service=data&request=GetFeature&data=LT_C_ADEMD_INFO&key=${apiKey}&domain=${port}&type=province`)
      .then(response => response.json())
      .then(data => {
        if (data.response && data.response.status === 'OK') {
          // 도의 정보를 provinces 상태에 저장
          setProvinces(data.response.result.featureCollection.features.map(item => item.properties));
        } else {
          setProvinces([]); // 오류가 있는 경우 빈 배열로 설정
        }
      })
      .catch(error => {
        console.error('Error fetching provinces:', error);
      });
  }, [port]);
  // 2. 도 선택 시, 시군구 리스트 요청
  useEffect(() => {
    if (selectedProvince) {
      setWorkplaceSido(selectedProvince); // 선택한 도 업데이트
      fetch(`/api/req/data?service=data&request=GetFeature&data=LT_C_ADSIGG_INFO&key=${apiKey}&domain=${port}&type=city&province=${selectedProvince}`)
        .then(response => response.json())
        .then(data => {
          if (data.response && data.response.status === 'OK') {
            setCities(data.response.result.featureCollection.features.map(item => item.properties));
          } else {
            setCities([]);
          }
        })
        .catch(error => {
          console.error('Error fetching cities:', error);
        });
    }
  }, [selectedProvince]);

  // 3. 시군구 선택 시, 읍면동 리스트 요청
  useEffect(() => {
    if (selectedCity) {
      setWorkplaceSigoon(selectedCity); // 선택한 시군구 업데이트
      fetch(`/api/req/data?service=data&request=GetFeature&data=LT_C_ADSIGG_INFO&key=${apiKey}&domain=${port}&type=town&city=${selectedCity}`)
        .then(response => response.json())
        .then(data => {
          if (data.response && data.response.status === 'OK') {
            setTowns(data.response.result.featureCollection.features.map(item => item.properties));
          } else {
            setTowns([]);
          }
        })
        .catch(error => {
          console.error('Error fetching towns:', error);
        });
    }
  }, [selectedCity]);

  return (
    <div>
      {/* 1. 도 선택 */}
      <h3>도 선택</h3>
      <ul>
        {provinces.map(province => (
          <li key={province.id} onClick={() => setSelectedProvince(province.name)}>
            {province.name}
          </li>
        ))}
      </ul>

      {/* 2. 시군구 선택 (도 선택 후) */}
      {selectedProvince && (
        <>
          <h3>{selectedProvince}의 시군구 선택</h3>
          <ul>
            {cities.map(city => (
              <li key={city.id} onClick={() => setSelectedCity(city.name)}>
                {city.name}
              </li>
            ))}
          </ul>
        </>
      )}

      {/* 3. 읍면동 선택 (시군구 선택 후) */}
      {selectedCity && (
        <>
          <h3>{selectedCity}의 읍면동 선택</h3>
          <ul>
            {towns.map(town => (
              <li key={town.id} onClick={() => {
                setSelectedTown(town.name); // 선택한 읍면동 업데이트
                setWorkplaceDong(town.name); // workplaceDong 업데이트
              }}>
                {town.name}
              </li>
            ))}
          </ul>
        </>
      )}

      {/* 선택한 값 출력 */}
      {selectedProvince && selectedCity && selectedTown && (
        <h4>
          선택한 위치: {selectedProvince}  {selectedCity}  {selectedTown}
        </h4>
      )}
    </div>
  );
};

export default LocationSelector;
