'use strict';

const seasonOneCards = [
  {
    "id": "accretion-001-base",
    "speciesId": "accretion-001",
    "editionId": "accretion-001-base-01",
    "number": "001",
    "species": "Mueca",
    "hp": 500,
    "role": "Activa",
    "skills": [
      {
        "ability": "Zarpazo",
        "cost": 1,
        "damage": 110
      },
      {
        "ability": "Embestida muda",
        "cost": 2,
        "effect": "Inflige 180 de daño, o 250 si Mueca recibió daño de un ataque durante el turno rival anterior."
      }
    ]
  },
  {
    "id": "accretion-002-base",
    "speciesId": "accretion-002",
    "editionId": "accretion-002-base-01",
    "number": "002",
    "species": "Véspero",
    "hp": 300,
    "role": "Híbrida",
    "skills": [
      {
        "ability": "Zarpa fugaz",
        "cost": 1,
        "damage": 100,
        "slot": "Activa"
      },
      {
        "ability": "Eco de la oleada",
        "cost": 1,
        "effect": "Mira en privado las dos primeras cartas de tu mazo y devuélvelas arriba en el orden que elijas. Requiere al menos dos cartas en el mazo.",
        "slot": "Apoyo"
      }
    ]
  },
  {
    "id": "accretion-003-base",
    "speciesId": "accretion-003",
    "editionId": "accretion-003-base-01",
    "number": "003",
    "species": "Nácaro",
    "hp": 650,
    "role": "Activa",
    "skills": [
      {
        "ability": "Embestida flotante",
        "cost": 1,
        "damage": 100
      },
      {
        "ability": "Sueño nacarado",
        "cost": 2,
        "effect": "Reduce hasta 150 de daño del primer ataque que vaya a infligir daño a Nácaro durante el próximo turno rival."
      }
    ]
  },
  {
    "id": "accretion-004-base",
    "speciesId": "accretion-004",
    "editionId": "accretion-004-base-01",
    "number": "004",
    "species": "Súrquilo",
    "hp": 425,
    "role": "Apoyo",
    "skills": [
      {
        "ability": "Veta azul",
        "cost": 2,
        "effect": "Tu activa gana 2 energías, hasta su máximo de 10. Requiere una activa por debajo del máximo."
      }
    ]
  },
  {
    "id": "accretion-005-base",
    "speciesId": "accretion-005",
    "editionId": "accretion-005-base-01",
    "number": "005",
    "species": "Velaria",
    "hp": 325,
    "role": "Apoyo",
    "skills": [
      {
        "ability": "Eco tardío",
        "cost": 2,
        "effect": "Durante el próximo turno rival, el primer ataque desde el puesto de activa cuesta 1 energía adicional."
      }
    ]
  },
  {
    "id": "accretion-006-base",
    "speciesId": "accretion-006",
    "editionId": "accretion-006-base-01",
    "number": "006",
    "species": "Vidraco",
    "hp": 450,
    "role": "Activa",
    "skills": [
      {
        "ability": "Mordida vítrea",
        "cost": 1,
        "damage": 95
      },
      {
        "ability": "Túnel de cristal",
        "cost": 4,
        "effect": "Inflige 350 de daño al objetivo normal. Si ambos puestos rivales están ocupados, puedes elegir al apoyo en su lugar e infligirle 250 de daño."
      }
    ]
  },
  {
    "id": "accretion-007-base",
    "speciesId": "accretion-007",
    "editionId": "accretion-007-base-01",
    "number": "007",
    "species": "Trémora",
    "hp": 525,
    "role": "Activa",
    "skills": [
      {
        "ability": "Pulso rasante",
        "cost": 1,
        "damage": 90
      },
      {
        "ability": "Retumbo subterráneo",
        "cost": 4,
        "effect": "Inflige 225 de daño al objetivo normal. Si ambos puestos rivales están ocupados, inflige también 125 de daño al apoyo simultáneamente."
      }
    ]
  },
  {
    "id": "accretion-008-base",
    "speciesId": "accretion-008",
    "editionId": "accretion-008-base-01",
    "number": "008",
    "species": "Brázaro",
    "hp": 550,
    "role": "Activa",
    "skills": [
      {
        "ability": "Pinzazo",
        "cost": 1,
        "damage": 110
      },
      {
        "ability": "Cepo de aire",
        "cost": 2,
        "effect": "Si la activa rival sobrevive al golpe, no puede ser reemplazada ni intercambiarse con el apoyo durante su próximo turno.",
        "damage": 160
      }
    ]
  },
  {
    "id": "accretion-009-base",
    "speciesId": "accretion-009",
    "editionId": "accretion-009-base-01",
    "number": "009",
    "species": "Plégora",
    "hp": 375,
    "role": "Apoyo",
    "skills": [
      {
        "ability": "Caída suspendida",
        "cost": 2,
        "effect": "Elige a tu activa. Aplaza hasta 100 del primer ataque que vaya a dañarla durante el próximo turno rival. Si aplazas daño, la criatura no puede salir voluntariamente de su puesto hasta recibirlo al final de tu siguiente turno."
      }
    ]
  },
  {
    "id": "accretion-010-base",
    "speciesId": "accretion-010",
    "editionId": "accretion-010-base-01",
    "number": "010",
    "species": "Sordal",
    "hp": 400,
    "role": "Apoyo",
    "skills": [
      {
        "ability": "Concha sorda",
        "cost": 2,
        "effect": "Reduce hasta 125 del primer ataque que vaya a dañar a Sordal durante el próximo turno rival."
      }
    ]
  },
  {
    "id": "accretion-011-base",
    "speciesId": "accretion-011",
    "editionId": "accretion-011-base-01",
    "number": "011",
    "species": "Záncaro",
    "hp": 350,
    "role": "Activa",
    "skills": [
      {
        "ability": "Pisada adelantada",
        "cost": 1,
        "effect": "Inflige 100 de daño, o 160 si Záncaro entró por reposición gratuita este turno."
      }
    ]
  },
  {
    "id": "accretion-012-base",
    "speciesId": "accretion-012",
    "editionId": "accretion-012-base-01",
    "number": "012",
    "species": "Vahélice",
    "hp": 325,
    "role": "Apoyo",
    "skills": [
      {
        "ability": "Aliento liberador",
        "cost": 2,
        "effect": "Elimina todo el agotamiento de tu activa o un bloqueo de movimiento que le impuso el rival. Vahélice se agota durante 1 turno propio."
      }
    ]
  },
  {
    "id": "accretion-013-base",
    "speciesId": "accretion-013",
    "editionId": "accretion-013-base-01",
    "number": "013",
    "species": "Nudrón",
    "hp": 575,
    "role": "Activa",
    "skills": [
      {
        "ability": "Nudillazo",
        "cost": 1,
        "damage": 115
      },
      {
        "ability": "Eco de aterrizaje",
        "cost": 4,
        "effect": "Elige a la activa rival. El eco le inflige 375 de daño de ataque al final del próximo turno rival. Si vuelve a la mano o cae antes del impacto, el eco se disipa."
      }
    ]
  },
  {
    "id": "accretion-014-base",
    "speciesId": "accretion-014",
    "editionId": "accretion-014-base-01",
    "number": "014",
    "species": "Ródice",
    "hp": 475,
    "role": "Activa",
    "skills": [
      {
        "ability": "Embestida circular",
        "cost": 1,
        "damage": 110
      },
      {
        "ability": "Órbita de guarda",
        "cost": 2,
        "effect": "Elige a tu apoyo agotado. Reduce hasta 150 del primer golpe de ataque que vaya a recibir durante el próximo turno rival."
      }
    ]
  },
  {
    "id": "accretion-015-base",
    "speciesId": "accretion-015",
    "editionId": "accretion-015-base-01",
    "number": "015",
    "species": "Hendral",
    "hp": 425,
    "role": "Apoyo",
    "skills": [
      {
        "ability": "Abrazo de savia",
        "cost": 2,
        "effect": "Cura hasta 150 PV a tu activa herida o al propio Hendral si está herido."
      }
    ]
  },
  {
    "id": "accretion-016-base",
    "speciesId": "accretion-016",
    "editionId": "accretion-016-base-01",
    "number": "016",
    "species": "Ténsula",
    "hp": 400,
    "role": "Activa",
    "skills": [
      {
        "ability": "Latigazo triple",
        "cost": 1,
        "damage": 105
      },
      {
        "ability": "Pliegue rasante",
        "cost": 2,
        "effect": "Ignora hasta 100 puntos de reducción de daño de este golpe.",
        "damage": 175
      }
    ]
  },
  {
    "id": "accretion-017-base",
    "speciesId": "accretion-017",
    "editionId": "accretion-017-base-01",
    "number": "017",
    "species": "Fálcoro",
    "hp": 525,
    "role": "Activa",
    "skills": [
      {
        "ability": "Golpe de marfil",
        "cost": 1,
        "damage": 110
      },
      {
        "ability": "Cierre de grieta",
        "cost": 2,
        "effect": "Fálcoro se agota durante 1 turno propio.",
        "damage": 250
      }
    ]
  },
  {
    "id": "accretion-018-base",
    "speciesId": "accretion-018",
    "editionId": "accretion-018-base-01",
    "number": "018",
    "species": "Lúmbar",
    "hp": 450,
    "role": "Apoyo",
    "skills": [
      {
        "ability": "Germinación nocturna",
        "cost": 4,
        "effect": "Recuperas 1 vida de jugador si tienes menos de 3. Una vez por jugador y partida."
      }
    ]
  },
  {
    "id": "accretion-019-base",
    "speciesId": "accretion-019",
    "editionId": "accretion-019-base-01",
    "number": "019",
    "species": "Cérulo",
    "hp": 375,
    "role": "Híbrida",
    "skills": [
      {
        "ability": "Aletazo de cauce",
        "cost": 1,
        "damage": 105,
        "slot": "Activa"
      },
      {
        "ability": "Corriente de arrastre",
        "cost": 2,
        "effect": "Añade 60 de daño al objetivo principal del próximo ataque de tu activa este turno si el objetivo es una criatura.",
        "slot": "Apoyo"
      }
    ]
  },
  {
    "id": "accretion-020-base",
    "speciesId": "accretion-020",
    "editionId": "accretion-020-base-01",
    "number": "020",
    "species": "Caldrón",
    "hp": 750,
    "role": "Activa",
    "skills": [
      {
        "ability": "Golpe de escoria",
        "cost": 1,
        "damage": 115
      },
      {
        "ability": "Apertura incandescente",
        "cost": 8,
        "effect": "Caldrón se agota durante 1 turno propio.",
        "damage": 500
      }
    ]
  },
  {
    "id": "accretion-021-base",
    "speciesId": "accretion-021",
    "editionId": "accretion-021-base-01",
    "number": "021",
    "species": "Hilván",
    "hp": 350,
    "role": "Apoyo",
    "skills": [
      {
        "ability": "Hebra de retorno",
        "cost": 1,
        "effect": "Elige una criatura de tu pila de eliminadas. Devuélvela a tu mano con todos sus PV, sin estados ni efectos pendientes y con 0 energía. Requiere un hueco en mano. Si pagas tu última vida, pierdes antes del retorno.",
        "unit": "life"
      }
    ]
  },
  {
    "id": "accretion-022-base",
    "speciesId": "accretion-022",
    "editionId": "accretion-022-base-01",
    "number": "022",
    "species": "Broquel",
    "hp": 550,
    "role": "Híbrida",
    "skills": [
      {
        "ability": "Golpe de mandíbula",
        "cost": 1,
        "damage": 100,
        "slot": "Activa"
      },
      {
        "ability": "Interposición",
        "cost": 2,
        "effect": "Elige a tu activa herida. Durante el próximo turno rival, desvía a Broquel hasta 125 del primer ataque que vaya a dañarla. Requiere que Broquel siga en apoyo y la elegida siga en activa.",
        "slot": "Apoyo"
      }
    ]
  },
  {
    "id": "accretion-023-base",
    "speciesId": "accretion-023",
    "editionId": "accretion-023-base-01",
    "number": "023",
    "species": "Replís",
    "hp": 475,
    "role": "Activa",
    "skills": [
      {
        "ability": "Coletazo en espiral",
        "cost": 1,
        "damage": 105
      },
      {
        "ability": "Cierre de cicatriz",
        "cost": 2,
        "effect": "Replís se cura hasta 125 PV."
      },
      {
        "ability": "Intercambio vital",
        "cost": 0,
        "effect": "Elige una criatura de tu pila de eliminadas que pueda ocupar el puesto de activa. Sacrifica a Replís sin perder vidas. Coloca a la elegida en su puesto con todos sus PV, sin estados ni efectos pendientes y con 0 energía. Al entrar, gana 1 energía y puede actuar este turno. Una vez por jugador y partida."
      }
    ]
  },
  {
    "id": "accretion-024-base",
    "speciesId": "accretion-024",
    "editionId": "accretion-024-base-01",
    "number": "024",
    "species": "Sélcar",
    "hp": 375,
    "role": "Apoyo",
    "skills": [
      {
        "ability": "Sutura de marfil",
        "cost": 3,
        "effect": "Si tu activa está a la mitad de sus PV máximos o menos, cúrala hasta 250 PV. Sélcar se agota durante 1 turno propio."
      }
    ]
  },
  {
    "id": "accretion-001-refugio",
    "speciesId": "accretion-001",
    "editionId": "accretion-001-refugio-01",
    "number": "001",
    "species": "Mueca",
    "hp": 500,
    "role": "Activa",
    "skills": [
      {
        "ability": "Zarpazo",
        "cost": 1,
        "damage": 110
      },
      {
        "ability": "Embestida muda",
        "cost": 3,
        "effect": "Inflige 180 de daño, o 300 si Mueca recibió daño de un ataque durante el turno rival anterior."
      }
    ],
    "variant": "Refugio",
    "path": "Amigo de la Naturaleza",
    "exclusive": true
  },
  {
    "id": "accretion-001-contencion",
    "speciesId": "accretion-001",
    "editionId": "accretion-001-contencion-01",
    "number": "001",
    "species": "Mueca",
    "hp": 500,
    "role": "Activa",
    "skills": [
      {
        "ability": "Zarpazo",
        "cost": 1,
        "damage": 110
      },
      {
        "ability": "Embestida de ruptura",
        "cost": 3,
        "effect": "Mueca se agota durante 1 turno propio.",
        "damage": 300
      }
    ],
    "variant": "Contención",
    "path": "Cazador Furtivo",
    "exclusive": true
  },
  {
    "id": "accretion-019-cauce-vivo",
    "speciesId": "accretion-019",
    "editionId": "accretion-019-cauce-vivo-01",
    "number": "019",
    "species": "Cérulo",
    "hp": 375,
    "role": "Híbrida",
    "skills": [
      {
        "ability": "Aletazo de cauce",
        "cost": 1,
        "damage": 105,
        "slot": "Activa"
      },
      {
        "ability": "Corriente de arrastre",
        "cost": 3,
        "effect": "Añade 90 de daño al objetivo principal del próximo ataque de tu activa este turno si el objetivo es una criatura.",
        "slot": "Apoyo"
      }
    ],
    "variant": "Cauce vivo",
    "path": "Amigo de la Naturaleza",
    "exclusive": true
  }
];
