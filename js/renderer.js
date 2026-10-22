const statusClass = (status) => `status-${String(status).toLowerCase().replaceAll(' ', '-')}`;
const initials = (name = '') => name.split(/\s+/).filter(Boolean).slice(0,2).map((part) => part[0]).join('').toUpperCase();
const formatDate = (value) => value ? new Intl.DateTimeFormat('ru-RU',{day:'2-digit',month:'short'}).format(new Date(`${value}T12:00:00`)) : '—';
const formatMoney = (value) => new Intl.NumberFormat('ru-RU',{style:'currency',currency:'RUB',maximumFractionDigits:0}).format(value ?? 0);
const make = (tag, className, text) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined && text !== null) element.textContent = String(text);
  return element;
};
const statusBadge = (status) => make('span', `status-badge ${statusClass(status)}`, status);
const priorityBadge = (priority) => make('span', `priority-badge ${priority === 'Высокий' ? 'priority-high' : 'priority-normal'}`, `${priority === 'Высокий' ? '▲ ' : '• '}${priority}`);
const metaItem = (label, value) => { const wrap = make('div','detail-item'); wrap.append(make('dt','',label),make('dd','',value)); return wrap; };

export function createBookingRow(booking, guests, rooms, onOpen) {
  const guest = guests.find((item) => item.id === booking.guestId);
  const room = rooms.find((item) => item.id === booking.roomId);
  const row = make('tr');
  const id = make('td','id-cell',booking.id); row.append(id);
  const guestCell = make('td'); const guestWrap = make('div','guest-cell'); guestWrap.append(make('span','guest-avatar',initials(booking.guestName))); const guestCopy = make('span'); guestCopy.append(make('strong','',booking.guestName),make('small','',guest?.email ?? 'Контакт не указан')); guestWrap.append(guestCopy); guestCell.append(guestWrap); row.append(guestCell);
  const roomCell = make('td'); const roomWrap = make('div','room-cell'); roomWrap.append(make('strong','',`№ ${booking.roomNumber}`),make('small','',room?.category ?? 'Номер')); roomCell.append(roomWrap); row.append(roomCell);
  const dates = make('td','date-cell'); const arrival = make('time','',formatDate(booking.arrival)); arrival.dateTime = booking.arrival; dates.append(arrival,make('small','',`до ${formatDate(booking.departure)}`)); row.append(dates);
  row.append(make('td','price-cell',formatMoney(booking.price)));
  const status = make('td'); status.append(statusBadge(booking.status)); row.append(status);
  const action = make('td'); const button = make('button','row-action','↗'); button.type='button'; button.setAttribute('aria-label',`Открыть бронь ${booking.id}`); button.addEventListener('click',() => onOpen(booking)); action.append(button); row.append(action);
  return row;
}

export function createFullBookingRow(booking, guests, rooms, onOpen) {
  const row = createBookingRow(booking,guests,rooms,onOpen);
  const dateCell = row.children[3];
  const departure = make('td','date-cell'); const time = make('time','',formatDate(booking.departure)); time.dateTime=booking.departure; departure.append(time); row.insertBefore(departure,row.children[4]);
  const statusCell = row.children[6]; const priorityCell = make('td'); priorityCell.append(priorityBadge(booking.priority)); row.insertBefore(priorityCell,statusCell.nextSibling);
  return row;
}

export function createBookingCard(booking, onOpen, onStatusChange) {
  const card = make('article','record-card'); card.tabIndex=0; card.setAttribute('role','button'); card.setAttribute('aria-label',`Подробности бронирования ${booking.id}`);
  const top=make('div','record-card-top'); top.append(make('span','id-cell',booking.id),statusBadge(booking.status)); card.append(top);
  card.append(make('h3','',booking.guestName),make('p','',`Номер ${booking.roomNumber} · ${formatDate(booking.arrival)} — ${formatDate(booking.departure)}`));
  const meta=make('div','record-card-meta'); const m1=make('div');m1.append(make('span','','Стоимость'),make('strong','',formatMoney(booking.price))); const m2=make('div');m2.append(make('span','','Приоритет'),priorityBadge(booking.priority));meta.append(m1,m2);card.append(meta);
  const actions=make('div','card-actions'); const detail=make('button','button button-secondary','Подробнее');detail.type='button';detail.addEventListener('click',(event)=>{event.stopPropagation();onOpen(booking)}); const advance=make('button','button button-primary',booking.status==='Подтверждено'?'Заселить':'Статус');advance.type='button';advance.addEventListener('click',(event)=>{event.stopPropagation();onStatusChange(booking)});actions.append(detail,advance);card.append(actions);
  card.addEventListener('click',()=>onOpen(booking));card.addEventListener('keydown',(event)=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();onOpen(booking)}});return card;
}

export function createRoomCard(room, onOpen, onToggleStatus) {
  const card=make('article','record-card room-card');card.tabIndex=0;card.setAttribute('role','button');card.setAttribute('aria-label',`Подробности номера ${room.number}`);
  const top=make('div','record-card-top');top.append(make('span','room-number',room.number),statusBadge(room.status));card.append(top,make('h3','',room.title),make('p','',room.description));
  const amenities=make('div','room-amenities');room.amenities.slice(0,4).forEach((item)=>amenities.append(make('span','tag',item)));card.append(amenities);
  const meta=make('div','record-card-meta');const a=make('div');a.append(make('span','','Стоимость за ночь'),make('strong','',formatMoney(room.price)));const b=make('div');b.append(make('span','','Категория · этаж'),make('strong','',`${room.category} · ${room.floor} этаж`));meta.append(a,b);card.append(meta);
  const actions=make('div','card-actions');const detail=make('button','button button-secondary','Подробнее');detail.type='button';detail.addEventListener('click',(e)=>{e.stopPropagation();onOpen(room)});const status=make('button','button button-primary',room.status==='Свободен'?'Отметить занятым':'Изменить статус');status.type='button';status.addEventListener('click',(e)=>{e.stopPropagation();onToggleStatus(room)});actions.append(detail,status);card.append(actions);
  card.addEventListener('click',()=>onOpen(room));card.addEventListener('keydown',(e)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onOpen(room)}});return card;
}

export function createGuestRow(guest, onOpen) {
  const row=make('tr');const nameCell=make('td');const wrap=make('div','guest-cell');wrap.append(make('span','guest-avatar',initials(guest.name)));const copy=make('span');copy.append(make('strong','',guest.name),make('small','',guest.id));wrap.append(copy);nameCell.append(wrap);row.append(nameCell);
  const contacts=make('td');contacts.append(make('span','',guest.email),make('br'),make('small','',guest.phone));row.append(contacts);
  const tier=make('td');tier.append(make('span',`tier-badge ${guest.tier==='VIP'?'priority-high':'status-стандарт'}`,guest.tier));row.append(tier);
  row.append(make('td','price-cell',guest.visits));const last=make('td');const time=make('time','',formatDate(guest.lastVisit));time.dateTime=guest.lastVisit;last.append(time);row.append(last);
  const pref=make('td');pref.append(make('span','',guest.preferences.room),make('br'),make('small','',guest.preferences.notes));row.append(pref);
  const action=make('td');const button=make('button','row-action','↗');button.type='button';button.setAttribute('aria-label',`Открыть профиль ${guest.name}`);button.addEventListener('click',()=>onOpen(guest));action.append(button);row.append(action);return row;
}

export function createHousekeepingCard(task,onStatusChange,onOpen) {
  const card=make('article','record-card housekeeping-card');const top=make('div','record-card-top');top.append(make('span','id-cell',task.id),statusBadge(task.status));card.append(top,make('h3','',`Номер ${task.roomNumber} · ${task.title}`),make('p','',task.description));
  const meta=make('div','record-card-meta');const a=make('div');a.append(make('span','','Ответственный'),make('strong','',task.assignee));const b=make('div');b.append(make('span','','Срок'),make('strong','',formatDate(task.dueAt)));meta.append(a,b);card.append(meta);
  const list=make('ul','detail-list');task.checklist.forEach((item)=>list.append(make('li','',item)));card.append(make('h3','detail-section-title','Чек-лист'),list);
  const actions=make('div','card-actions');const select=make('select');select.setAttribute('aria-label',`Статус задачи ${task.id}`);['Ожидает','В работе','Готово'].forEach((status)=>{const option=make('option','',status);option.value=status;option.selected=status===task.status;select.append(option)});select.addEventListener('change',()=>onStatusChange(task,select.value));const detail=make('button','button button-secondary','Подробнее');detail.type='button';detail.addEventListener('click',()=>onOpen(task));actions.append(select,detail);card.append(actions);return card;
}

export function createDetailContent(record, type, guests, rooms) {
  const fragment=document.createDocumentFragment();
  const description=make('p','detail-description',record.description ?? 'Подробная информация об элементе системы.');fragment.append(description);
  const grid=make('dl','detail-grid');
  const common=[['Идентификатор',record.id],['Название',record.title ?? record.name ?? `Номер ${record.number ?? record.roomNumber ?? ''}`],['Статус',record.status ?? record.tier ?? '—'],['Дата создания',record.createdAt ?? record.updatedAt ?? record.lastVisit ?? '—']];
  if(type==='booking') {const guest=guests.find((item)=>item.id===record.guestId);const room=rooms.find((item)=>item.id===record.roomId);common.push(['Гость',guest?.name ?? record.guestName],['Номер',room?`${room.number} · ${room.category}`:record.roomNumber],['Заезд',record.arrival],['Выезд',record.departure],['Стоимость',formatMoney(record.price)],['Приоритет',record.priority],['Email',guest?.email ?? record.guest?.email],['Телефон',guest?.phone ?? record.guest?.phone]);}
  else if(type==='room') {const guest=guests.find((item)=>item.id===record.guestId);common.push(['Номер',record.number],['Категория',record.category],['Этаж',record.floor],['Стоимость за ночь',formatMoney(record.price)],['Вместимость',`${record.capacity} гостя`],['Уборка',record.cleaningStatus],['Проживающий гость',guest?.name ?? 'Нет']);}
  else if(type==='guest') {common.push(['Email',record.email],['Телефон',record.phone],['Категория',record.tier],['Количество визитов',record.visits],['Последний визит',record.lastVisit],['Адрес',record.address],['Предпочтительный номер',record.preferences?.room],['Кровать',record.preferences?.bed],['Пожелания',record.preferences?.notes]);}
  else if(type==='housekeeping') {common.push(['Номер',record.roomNumber],['Ответственный',record.assignee],['Срок',record.dueAt],['Приоритет',record.priority],['Оценка времени',`${record.details?.minutes ?? '—'} минут`],['Зона',record.details?.zone]);}
  common.forEach(([label,value])=>{if(value!==undefined&&value!==null)grid.append(metaItem(label,typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)?formatDate(value):value))});fragment.append(grid);
  const tags=record.tags ?? record.amenities ?? record.preferences ? (record.tags ?? record.amenities ?? []) : [];
  if(tags.length){fragment.append(make('h3','detail-section-title',type==='room'?'Удобства':'Метки'));const tagWrap=make('div','detail-tags');tags.forEach((tag)=>tagWrap.append(make('span','tag',tag)));fragment.append(tagWrap)}
  if(type==='housekeeping'&&record.checklist){fragment.append(make('h3','detail-section-title','Чек-лист задачи'));const list=make('ul','detail-list');record.checklist.forEach((item)=>list.append(make('li','',item)));fragment.append(list)}
  if(type==='booking'&&record.notes)fragment.append(make('h3','detail-section-title','Примечание'),make('p','detail-description',record.notes));
  return fragment;
}

export function createReportItem(label,value) {const item=make('li');item.append(make('span','',label),make('strong','',value));return item;}
export { formatDate, formatMoney, statusClass, initials, make };
