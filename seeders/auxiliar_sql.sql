-- Set all columns with de_car_validado_sema_ha_ as car_area

UPDATE terrama2.infocolumn_column_list
  SET secondary_type = 'car_area'
WHERE
  column_name LIKE '%de_car_validado_sema_area_ha_'
  AND SECONDARY IS NULL;

UPDATE terrama2.infocolumn_column_list
  SET secondary_type = 'federal_car'
WHERE
  column_name LIKE '%de_car_validado_sema_numero_do1'
  AND SECONDARY IS NULL;

UPDATE terrama2.infocolumn_column_list
  SET secondary_type = 'state_car'
WHERE
  column_name LIKE '%de_car_validado_sema_numero_do2'
  AND SECONDARY IS NULL;

UPDATE terrama2.infocolumn_column_list
  SET secondary_type = 'city_geocode'
WHERE
  column_name LIKE '%geocodigo'
  AND SECONDARY IS NULL;

UPDATE terrama2.infocolumn_column_list
  SET secondary_type = 'date_value'
WHERE
  column_name LIKE '%inpe_date'
  AND SECONDARY IS NULL;
