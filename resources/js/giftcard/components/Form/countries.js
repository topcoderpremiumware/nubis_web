const countries = [
  {
    id: 15,
    label: "Afghanistan",
  },
  {
    id: 16,
    label: "Åland Islands",
  },
  {
    id: 17,
    label: "Albania",
  },
  {
    id: 18,
    label: "Algeria",
  },
  {
    id: 19,
    label: "American Samoa",
  },
  {
    id: 20,
    label: "Andorra",
  },
  {
    id: 21,
    label: "Angola",
  },
  {
    id: 22,
    label: "Anguilla",
  },
  {
    id: 23,
    label: "Antarctica",
  },
  {
    id: 24,
    label: "Antigua and Barbuda",
  },
  {
    id: 25,
    label: "Argentina",
  },
  {
    id: 26,
    label: "Armenia",
  },
  {
    id: 27,
    label: "Aruba",
  },
  {
    id: 28,
    label: "Australia",
  },
  {
    id: 29,
    label: "Austria",
  },
  {
    id: 30,
    label: "Azerbaijan",
  },
  {
    id: 31,
    label: "Bahamas",
  },
  {
    id: 32,
    label: "Bahrain",
  },
  {
    id: 33,
    label: "Bangladesh",
  },
  {
    id: 34,
    label: "Barbados",
  },
  {
    id: 35,
    label: "Belarus",
  },
  {
    id: 36,
    label: "Belgium",
  },
  {
    id: 37,
    label: "Belize",
  },
  {
    id: 38,
    label: "Benin",
  },
  {
    id: 39,
    label: "Bermuda",
  },
  {
    id: 40,
    label: "Bhutan",
  },
  {
    id: 41,
    label: "Bolivia (Plurinational State of)",
  },
  {
    id: 42,
    label: "Bonaire, Sint Eustatius and Saba",
  },
  {
    id: 43,
    label: "Bosnia and Herzegovina",
  },
  {
    id: 44,
    label: "Botswana",
  },
  {
    id: 45,
    label: "Bouvet Island",
  },
  {
    id: 46,
    label: "Brazil",
  },
  {
    id: 47,
    label: "British Indian Ocean Territory",
  },
  {
    id: 48,
    label: "Brunei Darussalam",
  },
  {
    id: 49,
    label: "Bulgaria",
  },
  {
    id: 50,
    label: "Burkina Faso",
  },
  {
    id: 51,
    label: "Burundi",
  },
  {
    id: 52,
    label: "Cabo Verde",
  },
  {
    id: 53,
    label: "Cambodia",
  },
  {
    id: 54,
    label: "Cameroon",
  },
  {
    id: 55,
    label: "Canada",
  },
  {
    id: 56,
    label: "Cayman Islands",
  },
  {
    id: 57,
    label: "Central African Republic",
  },
  {
    id: 58,
    label: "Chad",
  },
  {
    id: 59,
    label: "Chile",
  },
  {
    id: 60,
    label: "China",
  },
  {
    id: 61,
    label: "Christmas Island",
  },
  {
    id: 62,
    label: "Cocos (Keeling) Islands",
  },
  {
    id: 63,
    label: "Colombia",
  },
  {
    id: 64,
    label: "Comoros",
  },
  {
    id: 65,
    label: "Congo",
  },
  {
    id: 66,
    label: "Congo (Democratic Republic of the)",
  },
  {
    id: 67,
    label: "Cook Islands",
  },
  {
    id: 68,
    label: "Costa Rica",
  },
  {
    id: 69,
    label: "Côte d'Ivoire",
  },
  {
    id: 70,
    label: "Croatia",
  },
  {
    id: 71,
    label: "Cuba",
  },
  {
    id: 72,
    label: "Curaçao",
  },
  {
    id: 73,
    label: "Cyprus",
  },
  {
    id: 74,
    label: "Czechia",
  },
  {
    id: 2,
    label: "Denmark",
  },
  {
    id: 75,
    label: "Djibouti",
  },
  {
    id: 76,
    label: "Dominica",
  },
  {
    id: 77,
    label: "Dominican Republic",
  },
  {
    id: 78,
    label: "Ecuador",
  },
  {
    id: 79,
    label: "Egypt",
  },
  {
    id: 80,
    label: "El Salvador",
  },
  {
    id: 81,
    label: "Equatorial Guinea",
  },
  {
    id: 82,
    label: "Eritrea",
  },
  {
    id: 83,
    label: "Estonia",
  },
  {
    id: 84,
    label: "Ethiopia",
  },
  {
    id: 85,
    label: "Eswatini",
  },
  {
    id: 86,
    label: "Falkland Islands (Malvinas)",
  },
  {
    id: 87,
    label: "Faroe Islands",
  },
  {
    id: 88,
    label: "Fiji",
  },
  {
    id: 89,
    label: "Finland",
  },
  {
    id: 90,
    label: "France",
  },
  {
    id: 91,
    label: "French Guiana",
  },
  {
    id: 92,
    label: "French Polynesia",
  },
  {
    id: 93,
    label: "French Southern Territories",
  },
  {
    id: 94,
    label: "Gabon",
  },
  {
    id: 95,
    label: "Gambia",
  },
  {
    id: 96,
    label: "Georgia",
  },
  {
    id: 97,
    label: "Germany",
  },
  {
    id: 98,
    label: "Ghana",
  },
  {
    id: 99,
    label: "Gibraltar",
  },
  {
    id: 100,
    label: "Greece",
  },
  {
    id: 101,
    label: "Greenland",
  },
  {
    id: 102,
    label: "Grenada",
  },
  {
    id: 103,
    label: "Guadeloupe",
  },
  {
    id: 104,
    label: "Guam",
  },
  {
    id: 105,
    label: "Guatemala",
  },
  {
    id: 106,
    label: "Guernsey",
  },
  {
    id: 107,
    label: "Guinea",
  },
  {
    id: 108,
    label: "Guinea-Bissau",
  },
  {
    id: 109,
    label: "Guyana",
  },
  {
    id: 110,
    label: "Haiti",
  },
  {
    id: 111,
    label: "Heard Island and McDonald Islands",
  },
  {
    id: 112,
    label: "Holy See",
  },
  {
    id: 113,
    label: "Honduras",
  },
  {
    id: 114,
    label: "Hong Kong",
  },
  {
    id: 115,
    label: "Hungary",
  },
  {
    id: 116,
    label: "Iceland",
  },
  {
    id: 117,
    label: "India",
  },
  {
    id: 118,
    label: "Indonesia",
  },
  {
    id: 119,
    label: "Iran (Islamic Republic of)",
  },
  {
    id: 120,
    label: "Iraq",
  },
  {
    id: 121,
    label: "Ireland",
  },
  {
    id: 122,
    label: "Isle of Man",
  },
  {
    id: 123,
    label: "Israel",
  },
  {
    id: 124,
    label: "Italy",
  },
  {
    id: 125,
    label: "Jamaica",
  },
  {
    id: 126,
    label: "Japan",
  },
  {
    id: 127,
    label: "Jersey",
  },
  {
    id: 128,
    label: "Jordan",
  },
  {
    id: 129,
    label: "Kazakhstan",
  },
  {
    id: 130,
    label: "Kenya",
  },
  {
    id: 131,
    label: "Kiribati",
  },
  {
    id: 132,
    label: "Korea (Democratic People's Republic of)",
  },
  {
    id: 133,
    label: "Korea (Republic of)",
  },
  {
    id: 134,
    label: "Kuwait",
  },
  {
    id: 135,
    label: "Kyrgyzstan",
  },
  {
    id: 136,
    label: "Lao People's Democratic Republic",
  },
  {
    id: 137,
    label: "Latvia",
  },
  {
    id: 138,
    label: "Lebanon",
  },
  {
    id: 139,
    label: "Lesotho",
  },
  {
    id: 140,
    label: "Liberia",
  },
  {
    id: 141,
    label: "Libya",
  },
  {
    id: 142,
    label: "Liechtenstein",
  },
  {
    id: 143,
    label: "Lithuania",
  },
  {
    id: 144,
    label: "Luxembourg",
  },
  {
    id: 145,
    label: "Macao",
  },
  {
    id: 146,
    label: "North Macedonia",
  },
  {
    id: 147,
    label: "Madagascar",
  },
  {
    id: 148,
    label: "Malawi",
  },
  {
    id: 149,
    label: "Malaysia",
  },
  {
    id: 150,
    label: "Maldives",
  },
  {
    id: 151,
    label: "Mali",
  },
  {
    id: 152,
    label: "Malta",
  },
  {
    id: 153,
    label: "Marshall Islands",
  },
  {
    id: 154,
    label: "Martinique",
  },
  {
    id: 155,
    label: "Mauritania",
  },
  {
    id: 156,
    label: "Mauritius",
  },
  {
    id: 157,
    label: "Mayotte",
  },
  {
    id: 158,
    label: "Mexico",
  },
  {
    id: 159,
    label: "Micronesia (Federated States of)",
  },
  {
    id: 160,
    label: "Moldova (Republic of)",
  },
  {
    id: 161,
    label: "Monaco",
  },
  {
    id: 162,
    label: "Mongolia",
  },
  {
    id: 163,
    label: "Montenegro",
  },
  {
    id: 164,
    label: "Montserrat",
  },
  {
    id: 165,
    label: "Morocco",
  },
  {
    id: 166,
    label: "Mozambique",
  },
  {
    id: 167,
    label: "Myanmar",
  },
  {
    id: 168,
    label: "Namibia",
  },
  {
    id: 169,
    label: "Nauru",
  },
  {
    id: 170,
    label: "Nepal",
  },
  {
    id: 171,
    label: "Netherlands",
  },
  {
    id: 172,
    label: "New Caledonia",
  },
  {
    id: 173,
    label: "New Zealand",
  },
  {
    id: 174,
    label: "Nicaragua",
  },
  {
    id: 175,
    label: "Niger",
  },
  {
    id: 176,
    label: "Nigeria",
  },
  {
    id: 177,
    label: "Niue",
  },
  {
    id: 178,
    label: "Norfolk Island",
  },
  {
    id: 179,
    label: "Northern Mariana Islands",
  },
  {
    id: 180,
    label: "Norway",
  },
  {
    id: 181,
    label: "Oman",
  },
  {
    id: 182,
    label: "Pakistan",
  },
  {
    id: 183,
    label: "Palau",
  },
  {
    id: 184,
    label: "Palestine, State of",
  },
  {
    id: 185,
    label: "Panama",
  },
  {
    id: 186,
    label: "Papua New Guinea",
  },
  {
    id: 187,
    label: "Paraguay",
  },
  {
    id: 188,
    label: "Peru",
  },
  {
    id: 189,
    label: "Philippines",
  },
  {
    id: 190,
    label: "Pitcairn",
  },
  {
    id: 191,
    label: "Poland",
  },
  {
    id: 192,
    label: "Portugal",
  },
  {
    id: 193,
    label: "Puerto Rico",
  },
  {
    id: 194,
    label: "Qatar",
  },
  {
    id: 195,
    label: "Réunion",
  },
  {
    id: 196,
    label: "Romania",
  },
  {
    id: 197,
    label: "Russian Federation",
  },
  {
    id: 198,
    label: "Rwanda",
  },
  {
    id: 199,
    label: "Saint Barthélemy",
  },
  {
    id: 200,
    label: "Saint Helena, Ascension and Tristan da Cunha",
  },
  {
    id: 201,
    label: "Saint Kitts and Nevis",
  },
  {
    id: 202,
    label: "Saint Lucia",
  },
  {
    id: 203,
    label: "Saint Martin (French part)",
  },
  {
    id: 204,
    label: "Saint Pierre and Miquelon",
  },
  {
    id: 205,
    label: "Saint Vincent and the Grenadines",
  },
  {
    id: 206,
    label: "Samoa",
  },
  {
    id: 207,
    label: "San Marino",
  },
  {
    id: 208,
    label: "Sao Tome and Principe",
  },
  {
    id: 209,
    label: "Saudi Arabia",
  },
  {
    id: 210,
    label: "Senegal",
  },
  {
    id: 211,
    label: "Serbia",
  },
  {
    id: 212,
    label: "Seychelles",
  },
  {
    id: 213,
    label: "Sierra Leone",
  },
  {
    id: 214,
    label: "Singapore",
  },
  {
    id: 215,
    label: "Sint Maarten (Dutch part)",
  },
  {
    id: 216,
    label: "Slovakia",
  },
  {
    id: 217,
    label: "Slovenia",
  },
  {
    id: 218,
    label: "Solomon Islands",
  },
  {
    id: 219,
    label: "Somalia",
  },
  {
    id: 220,
    label: "South Africa",
  },
  {
    id: 221,
    label: "South Georgia and the South Sandwich Islands",
  },
  {
    id: 222,
    label: "South Sudan",
  },
  {
    id: 223,
    label: "Spain",
  },
  {
    id: 224,
    label: "Sri Lanka",
  },
  {
    id: 225,
    label: "Sudan",
  },
  {
    id: 226,
    label: "Suriname",
  },
  {
    id: 227,
    label: "Svalbard and Jan Mayen",
  },
  {
    id: 228,
    label: "Sweden",
  },
  {
    id: 229,
    label: "Switzerland",
  },
  {
    id: 230,
    label: "Syrian Arab Republic",
  },
  {
    id: 231,
    label: "Taiwan (Province of China)",
  },
  {
    id: 232,
    label: "Tajikistan",
  },
  {
    id: 233,
    label: "Tanzania, United Republic of",
  },
  {
    id: 234,
    label: "Thailand",
  },
  {
    id: 235,
    label: "Timor-Leste",
  },
  {
    id: 236,
    label: "Togo",
  },
  {
    id: 237,
    label: "Tokelau",
  },
  {
    id: 238,
    label: "Tonga",
  },
  {
    id: 239,
    label: "Trinidad and Tobago",
  },
  {
    id: 240,
    label: "Tunisia",
  },
  {
    id: 241,
    label: "Turkey",
  },
  {
    id: 242,
    label: "Turkmenistan",
  },
  {
    id: 243,
    label: "Turks and Caicos Islands",
  },
  {
    id: 244,
    label: "Tuvalu",
  },
  {
    id: 245,
    label: "Uganda",
  },
  {
    id: 246,
    label: "Ukraine",
  },
  {
    id: 247,
    label: "United Arab Emirates",
  },
  {
    id: 248,
    label: "United Kingdom of Great Britain and Northern Ireland",
  },
  {
    id: 249,
    label: "United States of America",
  },
  {
    id: 250,
    label: "United States Minor Outlying Islands",
  },
  {
    id: 251,
    label: "Uruguay",
  },
  {
    id: 252,
    label: "Uzbekistan",
  },
  {
    id: 253,
    label: "Vanuatu",
  },
  {
    id: 254,
    label: "Venezuela (Bolivarian Republic of)",
  },
  {
    id: 255,
    label: "Viet Nam",
  },
  {
    id: 256,
    label: "Virgin Islands (British)",
  },
  {
    id: 257,
    label: "Virgin Islands (U.S.)",
  },
  {
    id: 258,
    label: "Wallis and Futuna",
  },
  {
    id: 259,
    label: "Western Sahara",
  },
  {
    id: 260,
    label: "Yemen",
  },
  {
    id: 261,
    label: "Zambia",
  },
  {
    id: 262,
    label: "Zimbabwe",
  },
]

export default countries