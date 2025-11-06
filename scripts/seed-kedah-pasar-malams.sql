-- Kedah Pasar Malam seed script
-- Uses slug ids (e.g., pasar-malam-pekan-bedong) and Title Case addresses

BEGIN;

-- Remove previous rows for these names so we can reinsert with slug ids
DELETE FROM pasar_malams WHERE name IN (
  'Pasar Malam Pekan Bedong','Pasar Malam Taman Arked','Pasar Malam Bandar Puteri Jaya','Pasar Malam Taman Keladi','Pasar Malam Taman Kelisa','Uptown Sungai Petani','Pasar Basah Gurun Jaya','Pasar Malam Taman Ria Mesra 2','Pasar Malam Taman Ria Jaya','Pasar Malam Taman Kempas','Pasar Malam Kota Kuala Muda','Pasar Awam Kerpan','Pasar Malam Kuala Kedah','Pasar Malam Taman Mergong Jaya Fasa 1','Pasar Malam Taman Aman','Pekan Nat Pasar Pagi Ahad Anak Bukit','Pasar Malam Bandar Darulaman','Pasar Pagi Nat Taman Sri Aman','Pasar Basah Changlun','Pasar Malam / Bazaar Ramadhan Changlun','Pasar Kodiang','Pasar Pagi Pekan Nat Kuala Nerang','Pasar Malam Sungai Lalang','Pasar Malam Kg. Kelang Lama','Pasar Malam Taman Selasih','Pekan Ahad Baling','Pasar Tani Baling','Pasar Besar Kupang','Pasar Pagi Kupang'
);

-- Reinsert with slug ids and Title Case addresses
INSERT INTO pasar_malams (id, name, address, district, state, location, schedule)
VALUES 
-- 1
('pasar-malam-pekan-bedong','Pasar Malam Pekan Bedong','32, Jalan Taman Bandar Baru, Taman Bandar Baru Sungai Lalang','Bedong','Kedah',
 jsonb_build_object('latitude',5.70888555,'longitude',100.5343206,'gmaps_url','https://maps.app.goo.gl/wFGHNjtTHC66Uyk1A'),
 '[{"days":["sun"],"times":[{"start":"17:00","end":"22:00","note":"5-10pm"}]}]'),
-- 2
('pasar-malam-taman-arked','Pasar Malam Taman Arked','106, Jalan Fairuz 9, Kawasan Perusahaan Ringan Bakar Arang','Sungai Petani','Kedah',
 jsonb_build_object('latitude',5.623995644,'longitude',100.4720304,'gmaps_url','https://maps.app.goo.gl/WgDTmwQNFAZmofMi9'),
 '[{"days":["thu"],"times":[{"start":"16:30","end":"22:00","note":"4.30-10pm"}]}]'),
-- 3
('pasar-malam-bandar-puteri-jaya','Pasar Malam Bandar Puteri Jaya','Bandar Puteri Jaya','Sungai Petani','Kedah',
 jsonb_build_object('latitude',5.610612104,'longitude',100.53134,'gmaps_url','https://maps.app.goo.gl/hXbnPG7fUBJ3ZUHK6'),
 '[{"days":["wed","sun"],"times":[{"start":"16:30","end":"21:00","note":"4.30-9pm"}]}]'),
-- 4
('pasar-malam-taman-keladi','Pasar Malam Taman Keladi','365, Lorong Angsana 1, Taman Keladi','Sungai Petani','Kedah',
 jsonb_build_object('latitude',5.616405079,'longitude',100.5043822,'gmaps_url','https://maps.app.goo.gl/EDGRTCAE2tgy3s978'),
 '[{"days":["sun"],"times":[{"start":"17:00","end":"22:00","note":"5-10pm"}]}]'),
-- 5
('pasar-malam-taman-kelisa','Pasar Malam Taman Kelisa','Taman Kelisa Ria','Sungai Petani','Kedah',
 jsonb_build_object('latitude',5.636922739,'longitude',100.5582043,'gmaps_url','https://maps.app.goo.gl/MoV7Npzsg3bx4g7G8'),
 '[{"days":["tue","thu"],"times":[{"start":"18:00","end":"21:00","note":"6-9pm"}]}]'),
-- 6
('uptown-sungai-petani','Uptown Sungai Petani','Jalan Merbok, Taman Pekan Baru','Sungai Petani','Kedah',
 jsonb_build_object('latitude',5.640523831,'longitude',100.4856301,'gmaps_url','https://maps.app.goo.gl/ccVA78Miey6s1Ype7'),
 '[{"days":["fri","sat","sun"],"times":[{"start":"19:00","end":"00:00","note":"7pm-12am"}]}]'),
-- 7
('pasar-basah-gurun-jaya','Pasar Basah Gurun Jaya','Jalan Gurun Jaya, Kampung Baharu','Gurun','Kedah',
 jsonb_build_object('latitude',5.815846061,'longitude',100.4751148,'gmaps_url','https://maps.app.goo.gl/y59JN4as2XnDmJmC7'),
 '[{"days":["mon","tue","wed","thu","fri","sat","sun"],"times":[{"start":"05:00","end":"22:00","note":"5am-10pm"}]}]'),
-- 8
('pasar-malam-taman-ria-mesra-2','Pasar Malam Taman Ria Mesra 2','Lorong Ria Mesra 13, Kampung Batu 5','Gurun','Kedah',
 jsonb_build_object('latitude',5.813473786,'longitude',100.5441232,'gmaps_url','https://maps.app.goo.gl/6Bt6eAbff1pxDL6C7'),
 '[{"days":["wed"],"times":[{"start":"17:00","end":"22:00","note":"5-10pm"}]}]'),
-- 9
('pasar-malam-taman-ria-jaya','Pasar Malam Taman Ria Jaya','186, Lorong Gamelan 2, Taman Ria Jaya','Sungai Petani','Kedah',
 jsonb_build_object('latitude',5.65226461,'longitude',100.5160021,'gmaps_url','https://maps.app.goo.gl/zNPkXkGgFzz91tiG7'),
 '[{"days":["tue","sat"],"times":[{"start":"16:00","end":"22:00","note":"4-10pm"}]}]'),
-- 10
('pasar-malam-taman-kempas','Pasar Malam Taman Kempas','Jalan Kempas','Sungai Petani','Kedah',
 jsonb_build_object('latitude',5.590174389,'longitude',100.4840231,'gmaps_url','https://maps.app.goo.gl/1pbgLcCRdswA9D6D6'),
 '[{"days":["fri"],"times":[{"start":"16:00","end":"21:30","note":"4-9.30pm"}]}]'),
-- 11
('pasar-malam-kota-kuala-muda','Pasar Malam Kota Kuala Muda','Kampung Kepala Jalan','Kota Kuala Muda','Kedah',
 jsonb_build_object('latitude',5.585310991,'longitude',100.3395459,'gmaps_url','https://maps.app.goo.gl/ggGvdppG5rKqdRUf9'),
 '[{"days":["mon","wed"],"times":[{"start":"18:00","end":"22:00","note":"6-10pm"}]}]'),
-- 12
('pasar-awam-kerpan','Pasar Awam Kerpan','Kampung Simpang Empat Kerpan','Ayer Hitam','Kedah',
 jsonb_build_object('latitude',6.259960485,'longitude',100.2282958,'gmaps_url','https://maps.app.goo.gl/iaAa8M6tjSt4t1My5'),
 '[{"days":["mon","tue","wed","thu","fri","sat","sun"],"times":[{"start":"07:00","end":"18:00","note":"7am-6pm"}]}]'),
-- 13
('pasar-malam-kuala-kedah','Pasar Malam Kuala Kedah','Kampung Tepi Laut','Kuala Kedah','Kedah',
 jsonb_build_object('latitude',6.097349888,'longitude',100.3022876,'gmaps_url','https://maps.app.goo.gl/bNbCnTik8eAwPusP8'),
 '[{"days":["thu"],"times":[{"start":"18:00","end":"22:30","note":"6-10.30pm"}]}]'),
-- 14
('pasar-malam-taman-mergong-jaya-fasa-1','Pasar Malam Taman Mergong Jaya Fasa 1','Kampung Batin','Alor Setar','Kedah',
 jsonb_build_object('latitude',6.14046203,'longitude',100.3364439,'gmaps_url','https://maps.app.goo.gl/Ub9roo1WL5CnTamKA'),
 '[{"days":["thu"],"times":[{"start":"17:00","end":"21:30","note":"5-9.30pm"}]}]'),
-- 15
('pasar-malam-taman-aman','Pasar Malam Taman Aman','Alor Setar','Alor Setar','Kedah',
 jsonb_build_object('latitude',6.186704596,'longitude',100.3665747,'gmaps_url','https://maps.app.goo.gl/68aGGpKP4CF23e6R6'),
 '[{"days":["mon","fri"],"times":[{"start":"17:00","end":"21:30","note":"5-9.30pm"}]}]'),
-- 16
('pekan-nat-pasar-pagi-ahad-anak-bukit','Pekan Nat Pasar Pagi Ahad Anak Bukit','32, Jalan Anak Bukit, Anak Bukit','Alor Setar','Kedah',
 jsonb_build_object('latitude',6.181527678,'longitude',100.3730643,'gmaps_url','https://maps.app.goo.gl/HkUvnkhC9cGp1aXD7'),
 '[{"days":["sun"],"times":[{"start":"09:00","end":"12:00","note":"9am-12pm"}]}]'),
-- 17
('pasar-malam-bandar-darulaman','Pasar Malam Bandar Darulaman','Bandar Darulaman','Jitra','Kedah',
 jsonb_build_object('latitude',6.236432036,'longitude',100.4212471,'gmaps_url','https://maps.app.goo.gl/cP42T8SHEzueRp1N9'),
 '[{"days":["thu"],"times":[{"start":"16:00","end":"22:30","note":"4-10.30pm"}]}]'),
-- 18
('pasar-pagi-nat-taman-sri-aman','Pasar Pagi Nat Taman Sri Aman','Kampung Pantai Halban','Jitra','Kedah',
 jsonb_build_object('latitude',6.2539162,'longitude',100.4268839,'gmaps_url','https://maps.app.goo.gl/goBvbCJVgVMSZqes5'),
 '[{"days":["mon","tue","wed","thu","fri","sat","sun"],"times":[{"start":"09:00","end":"13:00","note":"9am-1pm"}]}]'),
-- 19
('pasar-basah-changlun','Pasar Basah Changlun','Changlun','Bukit Kayu Hitam','Kedah',
 jsonb_build_object('latitude',6.431388016,'longitude',100.4296212,'gmaps_url','https://maps.app.goo.gl/4mv14t1deSgmT7qA6'),
 '[{"days":["mon","tue","wed","thu","fri","sat","sun"],"times":[{"start":"06:00","end":"19:00","note":"6am-7pm"}]}]'),
-- 20
('pasar-malam-bazaar-ramadhan-changlun','Pasar Malam / Bazaar Ramadhan Changlun','Kampung Baru Changloon','Changlun','Kedah',
 jsonb_build_object('latitude',6.43264487,'longitude',100.4307783,'gmaps_url','https://maps.app.goo.gl/VjDd19gJphqUksux8'),
 '[{"days":["wed"],"times":[{"start":"17:00","end":"20:00","note":"5-8pm"}]}]'),
-- 21
('pasar-kodiang','Pasar Kodiang','Kampung Kandis','Kodiang','Kedah',
 jsonb_build_object('latitude',6.391553,'longitude',100.3049577,'gmaps_url','https://maps.app.goo.gl/4hLVAcSetDuwwVfp7'),
 '[{"days":["mon","tue","wed","thu","fri","sat","sun"],"times":[{"start":"07:00","end":"23:00","note":"7am-11pm"}]}]'),
-- 22
('pasar-pagi-pekan-nat-kuala-nerang','Pasar Pagi Pekan Nat Kuala Nerang','Kuala Nerang','Kuala Nerang','Kedah',
 jsonb_build_object('latitude',6.25814334,'longitude',100.6093203,'gmaps_url','https://maps.app.goo.gl/5jtwRtZJqJXjJ4i8A'),
 '[{"days":["tue","sat"],"times":[{"start":"08:00","end":"13:00","note":"8am-1pm"}]}]'),
-- 23
('pasar-malam-sungai-lalang','Pasar Malam Sungai Lalang','32, Jalan Taman Bandar Baru, Taman Bandar Baru Sungai Lalang','Bedong','Kedah',
 jsonb_build_object('latitude',5.71090033,'longitude',100.5337506,'gmaps_url','https://maps.app.goo.gl/nWCBoAFrwHkbh87G7'),
 '[{"days":["mon","thu"],"times":[{"start":"18:00","end":"22:00","note":"6-10pm"}]}]'),
-- 24
('pasar-malam-kg-kelang-lama','Pasar Malam Kg. Kelang Lama','Kampung Kelang Lama','Kulim','Kedah',
 jsonb_build_object('latitude',5.388784124,'longitude',100.565872,'gmaps_url','https://maps.app.goo.gl/xkSJ4ktvbxb8y2K69'),
 '[{"days":["thu","sun"],"times":[{"start":"17:00","end":"23:00","note":"5-11pm"}]}]'),
-- 25
('pasar-malam-taman-selasih','Pasar Malam Taman Selasih','Lorong Semarak 5, Taman Selasih','Kulim','Kedah',
 jsonb_build_object('latitude',5.378483237,'longitude',100.540133,'gmaps_url','https://maps.app.goo.gl/5FdgZa8HQpATPATY7'),
 '[{"days":["fri"],"times":[{"start":"17:00","end":"00:00","note":"5pm-12am"}]}]'),
-- 26
('pekan-ahad-baling','Pekan Ahad Baling','Baling','Baling','Kedah',
 jsonb_build_object('latitude',5.674633012,'longitude',100.9191745,'gmaps_url','https://maps.app.goo.gl/QWfcpENCNN35hWxF8'),
 '[{"days":["sun"],"times":[{"start":"08:00","end":"13:00","note":"8am-1pm"}]}]'),
-- 27
('pasar-tani-baling','Pasar Tani Baling','63D, Jalan Badlishah','Baling','Kedah',
 jsonb_build_object('latitude',5.674786384,'longitude',100.9191984,'gmaps_url','https://maps.app.goo.gl/BFDv3bYDDKknM8YZ7'),
 '[{"days":["wed"],"times":[{"start":"08:00","end":"13:00","note":"8am-1pm"}]}]'),
-- 28
('pasar-besar-kupang','Pasar Besar Kupang','Kupang','Kupang','Kedah',
 jsonb_build_object('latitude',5.635182646,'longitude',100.8454501,'gmaps_url','https://maps.app.goo.gl/4Y7StEB86CFuRwPCA'),
 '[{"days":["mon","tue","wed","thu","fri","sat","sun"],"times":[{"start":"07:00","end":"12:00","note":"7am-12pm"}]}]'),
-- 29
('pasar-pagi-kupang','Pasar Pagi Kupang','Pasar Pagi Pekan','Kupang','Kedah',
 jsonb_build_object('latitude',5.634536185,'longitude',100.8483453,'gmaps_url','https://maps.app.goo.gl/noaKc58NEvzJSUpU7'),
 '[{"days":["mon","tue","wed","thu","fri","sat","sun"],"times":[{"start":"06:00","end":"14:00","note":"6am-2pm"}]}]');

COMMIT;


