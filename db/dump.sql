.headers on
.separator "\t"
.echo on
select * from user;
select * from token;
select * from [group];
select * from channel;
select * from platform;
select * from platform_user;
select * from group_user;
select * from event;
select * from event_participant;
select * from event_alternative;
select u.id, u.name, g.name, p.name 
  from user u 
  left join group_user gu on gu.user_id = u.id 
  left join [group] g on gu.group_id = g.id 
  left join platform_user pu on pu.user_id = u.id 
  left join platform p on p.id = pu.platform_id;
select e.id, e.name, e.[when], e.platform_id, g.name, u.name
  from event e
  join [group] g on e.group_id = g.id
  left join event_participant ep on e.id = ep.event_id
  left join user u on ep.user_id = u.id;



.quit