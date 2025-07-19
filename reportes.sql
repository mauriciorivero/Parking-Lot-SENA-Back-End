--Consulta reporte 1
select * from USUARIO

--Consulta reporte 2
SELECT
vehiculo.placa, 
vehiculo.marca,
VEHICULO.tipo,
vehiculo.color,
USUARIO.numero_documento,
USUARIO.primer_nombre,
USUARIO.primer_apellido
FROM
USUARIO, VEHICULO
WHERE
USUARIO.id_usuario = VEHICULO.USUARIO_id_usuario

--consulta reporte 3
select 
ACCESO_SALIDAS.movimiento,
ACCESO_SALIDAS.fecha_hora,
ACCESO_SALIDAS.puerta,
VEHICULO.placa
FROM
ACCESO_SALIDAS, VEHICULO
WHERE 
ACCESO_SALIDAS.VEHICULO_id = VEHICULO.id
AND
ACCESO_SALIDAS.movimiento = 'entrada'

--consulta reporte 4
select 
ACCESO_SALIDAS.movimiento,
ACCESO_SALIDAS.fecha_hora,
ACCESO_SALIDAS.puerta,
ACCESO_SALIDAS.tiempo_estadia,
VEHICULO.placa
FROM
ACCESO_SALIDAS, VEHICULO
WHERE 
ACCESO_SALIDAS.VEHICULO_id = VEHICULO.id
AND
ACCESO_SALIDAS.movimiento = 'salida'

--consulta reporte 5
select 
INCIDENCIA.nombre,
REPORTE_INCIDENCIA.fecha_hora,
VEHICULO.placa
FROM
INCIDENCIA, REPORTE_INCIDENCIA, VEHICULO
WHERE
REPORTE_INCIDENCIA.INCIDENCIA_id = INCIDENCIA.id
AND
VEHICULO.id = REPORTE_INCIDENCIA.VEHICULO_id

--consulta reporte 6
select 
INCIDENCIA.nombre,
REPORTE_INCIDENCIA.fecha_hora,
VEHICULO.placa,
USUARIO.primer_nombre,
USUARIO.primer_apellido,
USUARIO.numero_celular,
USUARIO.direccion_correo
FROM
INCIDENCIA, REPORTE_INCIDENCIA, VEHICULO, USUARIO
WHERE
REPORTE_INCIDENCIA.INCIDENCIA_id = INCIDENCIA.id
AND
VEHICULO.id = REPORTE_INCIDENCIA.VEHICULO_id
AND
VEHICULO.USUARIO_id_usuario = USUARIO.id_usuario