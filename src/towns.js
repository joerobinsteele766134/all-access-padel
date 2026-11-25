// UK towns and cities that get their own "Padel courts in <town>" page.
// Format: "Name|Region or country" — the region is used to pick the right place when geocoding
// (postcodes.io places API), so "Newport|Wales" isn't confused with Newport on the Isle of Wight.
const RAW = `
London|London
Westminster|London
Chelsea|London
Fulham|London
Battersea|London
Clapham|London
Wandsworth|London
Putney|London
Wimbledon|London
Richmond|London
Kingston upon Thames|London
Twickenham|London
Hammersmith|London
Chiswick|London
Ealing|London
Acton|London
Shepherd's Bush|London
Notting Hill|London
Kensington|London
Camden Town|London
Islington|London
Hackney|London
Shoreditch|London
Stratford|London
Canary Wharf|London
Greenwich|London
Lewisham|London
Brixton|London
Dulwich|London
Crystal Palace|London
Croydon|London
Bromley|London
Sutton|London
Harrow|London
Wembley|London
Hendon|London
Finchley|London
Barnet|London
Enfield|London
Walthamstow|London
Ilford|London
Romford|London
Uxbridge|London
Hounslow|London
Bexleyheath|London
Woolwich|London
Birmingham|West Midlands
Solihull|West Midlands
Sutton Coldfield|West Midlands
Wolverhampton|West Midlands
Coventry|West Midlands
Walsall|West Midlands
West Bromwich|West Midlands
Dudley|West Midlands
Stourbridge|West Midlands
Kidderminster|West Midlands
Worcester|West Midlands
Redditch|West Midlands
Bromsgrove|West Midlands
Stratford-upon-Avon|West Midlands
Warwick|West Midlands
Leamington Spa|West Midlands
Rugby|West Midlands
Nuneaton|West Midlands
Tamworth|West Midlands
Lichfield|West Midlands
Stafford|West Midlands
Stoke-on-Trent|West Midlands
Newcastle-under-Lyme|West Midlands
Burton upon Trent|West Midlands
Telford|West Midlands
Shrewsbury|West Midlands
Hereford|West Midlands
Manchester|North West
Salford|North West
Stockport|North West
Altrincham|North West
Sale|North West
Wilmslow|North West
Didsbury|North West
Bolton|North West
Bury|North West
Rochdale|North West
Oldham|North West
Wigan|North West
Warrington|North West
Liverpool|North West
Southport|North West
St Helens|North West
Chester|North West
Macclesfield|North West
Crewe|North West
Knutsford|North West
Preston|North West
Blackpool|North West
Lytham St Annes|North West
Blackburn|North West
Burnley|North West
Lancaster|North West
Kendal|North West
Carlisle|North West
Leeds|Yorkshire and The Humber
Bradford|Yorkshire and The Humber
Harrogate|Yorkshire and The Humber
York|Yorkshire and The Humber
Wakefield|Yorkshire and The Humber
Huddersfield|Yorkshire and The Humber
Halifax|Yorkshire and The Humber
Ilkley|Yorkshire and The Humber
Dewsbury|Yorkshire and The Humber
Sheffield|Yorkshire and The Humber
Rotherham|Yorkshire and The Humber
Barnsley|Yorkshire and The Humber
Doncaster|Yorkshire and The Humber
Hull|Yorkshire and The Humber
Beverley|Yorkshire and The Humber
Scarborough|Yorkshire and The Humber
Grimsby|Yorkshire and The Humber
Cleethorpes|Yorkshire and The Humber
Scunthorpe|Yorkshire and The Humber
Newcastle upon Tyne|North East
Gateshead|North East
Sunderland|North East
Durham|North East
Darlington|North East
Middlesbrough|North East
Stockton-on-Tees|North East
Hartlepool|North East
Tynemouth|North East
Whitley Bay|North East
Morpeth|North East
Hexham|North East
Nottingham|East Midlands
Derby|East Midlands
Leicester|East Midlands
Loughborough|East Midlands
Lincoln|East Midlands
Northampton|East Midlands
Kettering|East Midlands
Corby|East Midlands
Wellingborough|East Midlands
Mansfield|East Midlands
Chesterfield|East Midlands
Newark-on-Trent|East Midlands
Grantham|East Midlands
Boston|East Midlands
Market Harborough|East Midlands
Oakham|East Midlands
Melton Mowbray|East Midlands
Hinckley|East Midlands
Bakewell|East Midlands
Cambridge|East of England
Peterborough|East of England
Huntingdon|East of England
St Neots|East of England
Ely|East of England
Norwich|East of England
King's Lynn|East of England
Great Yarmouth|East of England
Ipswich|East of England
Bury St Edmunds|East of England
Newmarket|East of England
Colchester|East of England
Chelmsford|East of England
Brentwood|East of England
Southend-on-Sea|East of England
Basildon|East of England
Harlow|East of England
Saffron Walden|East of England
St Albans|East of England
Watford|East of England
Hemel Hempstead|East of England
Harpenden|East of England
Hertford|East of England
Stevenage|East of England
Hitchin|East of England
Welwyn Garden City|East of England
Bishop's Stortford|East of England
Luton|East of England
Bedford|East of England
Oxford|South East
Witney|South East
Abingdon|South East
Didcot|South East
Wantage|South East
Banbury|South East
Bicester|South East
Henley-on-Thames|South East
Thame|South East
Chipping Norton|South East
Carterton|South East
Woodstock|South East
Reading|South East
Wokingham|South East
Bracknell|South East
Newbury|South East
Maidenhead|South East
Windsor|South East
Ascot|South East
Slough|South East
High Wycombe|South East
Marlow|South East
Beaconsfield|South East
Amersham|South East
Aylesbury|South East
Milton Keynes|South East
Buckingham|South East
Guildford|South East
Woking|South East
Epsom|South East
Leatherhead|South East
Dorking|South East
Reigate|South East
Redhill|South East
Esher|South East
Cobham|South East
Weybridge|South East
Camberley|South East
Farnham|South East
Godalming|South East
Cranleigh|South East
Haslemere|South East
Crawley|South East
Horsham|South East
East Grinstead|South East
Haywards Heath|South East
Burgess Hill|South East
Brighton|South East
Hove|South East
Worthing|South East
Chichester|South East
Bognor Regis|South East
Eastbourne|South East
Hastings|South East
Lewes|South East
Tunbridge Wells|South East
Tonbridge|South East
Sevenoaks|South East
Maidstone|South East
Canterbury|South East
Ashford|South East
Folkestone|South East
Margate|South East
Ramsgate|South East
Whitstable|South East
Dartford|South East
Gravesend|South East
Chatham|South East
Rochester|South East
Southampton|South East
Portsmouth|South East
Winchester|South East
Basingstoke|South East
Andover|South East
Farnborough|South East
Fleet|South East
Alton|South East
Petersfield|South East
Fareham|South East
Eastleigh|South East
Romsey|South East
Lymington|South East
Newport|South East|newport-isle-of-wight
Ryde|South East
Bristol|South West
Bath|South West
Weston-super-Mare|South West
Clevedon|South West
Taunton|South West
Yeovil|South West
Bridgwater|South West
Frome|South West
Wells|South West
Exeter|South West
Exmouth|South West
Plymouth|South West
Torquay|South West
Paignton|South West
Newton Abbot|South West
Barnstaple|South West
Truro|South West
Falmouth|South West
Newquay|South West
St Ives|South West
Penzance|South West
Bodmin|South West
Bournemouth|South West
Poole|South West
Christchurch|South West
Dorchester|South West
Weymouth|South West
Sherborne|South West
Salisbury|South West
Swindon|South West
Marlborough|South West
Chippenham|South West
Devizes|South West
Trowbridge|South West
Cheltenham|South West
Gloucester|South West
Cirencester|South West
Stroud|South West
Tewkesbury|South West
Stow-on-the-Wold|South West
Bourton-on-the-Water|South West
Moreton-in-Marsh|South West
Cardiff|Wales
Newport|Wales
Swansea|Wales
Bridgend|Wales
Barry|Wales
Penarth|Wales
Cowbridge|Wales
Pontypridd|Wales
Caerphilly|Wales
Merthyr Tydfil|Wales
Monmouth|Wales
Abergavenny|Wales
Chepstow|Wales
Llanelli|Wales
Carmarthen|Wales
Aberystwyth|Wales
Wrexham|Wales
Llandudno|Wales
Bangor|Wales
Edinburgh|Scotland
Glasgow|Scotland
Aberdeen|Scotland
Dundee|Scotland
Inverness|Scotland
Stirling|Scotland
Perth|Scotland
St Andrews|Scotland
Paisley|Scotland
East Kilbride|Scotland
Livingston|Scotland
Dunfermline|Scotland
Kirkcaldy|Scotland
Ayr|Scotland
Kilmarnock|Scotland
Falkirk|Scotland
Musselburgh|Scotland
North Berwick|Scotland
Dumfries|Scotland
Belfast|Northern Ireland
Lisburn|Northern Ireland
Newry|Northern Ireland
Bangor|Northern Ireland
Derry|Northern Ireland
Ballymena|Northern Ireland
Newtownards|Northern Ireland
Armagh|Northern Ireland
Coleraine|Northern Ireland
Omagh|Northern Ireland
`;

export const slugify = s => s.toLowerCase().replace(/&/g, "and").replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const seen = new Set();
export const TOWN_LIST = RAW.trim().split("\n").map(l => {
  const [name, region, fixed] = l.split("|");
  let slug = fixed || slugify(name);
  if (seen.has(slug)) slug = `${slug}-${slugify(region)}`;
  seen.add(slug);
  return { name, region, slug };
});
