-- Kelantan markets
INSERT INTO pasar_malams (
  id, name, address, district, state, status, description,
  area_m2, total_shop,
  parking_available, parking_accessible, parking_notes,
  amen_toilet, amen_prayer_room,
  location, schedule
) VALUES
-- Pasar Malam Chabang Berlian, Lundang
('kota-bharu-chabang-berlian-lundang',
 'Pasar Malam Chabang Berlian, Lundang',
 'Chabang Berlian, 15200 Kota Bharu, Kelantan, 15200',
 'Kota Bharu',
 'Kelantan',
 'Active',
 NULL,
 NULL, NULL,
 FALSE, FALSE, NULL,
 FALSE, FALSE,
 '{"latitude": 6.107100874179752, "longitude": 102.2583966324701, "gmaps_link": "https://maps.app.goo.gl/1j6zA6dBx7YEQ4YYA"}'::jsonb,
 '[
    {"days": ["thu"], "times": [{"start": "17:00", "end": "23:00", "note": "Khamis 5-11pm"}]}
  ]'::jsonb
),

-- Pasar Malam Padang Tembak (& Ramadhan Bazaar)
('kota-bharu-padang-tembak',
 'Pasar Malam Padang Tembak (& Ramadhan Bazaar)',
 'Jalan 4a/44, Kawasan Perindustrian Fasa 2, Pengkalan Chepa, 16100 Kota Bharu, Kelantan',
 'Kota Bharu',
 'Kelantan',
 'Active',
 NULL,
 NULL, NULL,
 FALSE, FALSE, NULL,
 FALSE, FALSE,
 '{"latitude": 6.1467238990679816, "longitude": 102.30066484531636, "gmaps_link": "https://maps.app.goo.gl/rv1N5kZJMcUrSEDf7"}'::jsonb,
 '[
    {"days": ["mon","wed"], "times": [{"start": "16:00", "end": "22:00", "note": "Isnin, Rabu 4-10pm"}]}
  ]'::jsonb
),

-- Pasar Malam Berek 12
('kota-bharu-berek-12',
 'Pasar Malam Berek 12',
 'Lorong Senai, 15200 Kota Bharu, Kelantan',
 'Kota Bharu',
 'Kelantan',
 'Active',
 NULL,
 NULL, NULL,
 FALSE, FALSE, NULL,
 FALSE, FALSE,
 '{"latitude": 6.12462209212401, "longitude": 102.25443164743932, "gmaps_link": "https://maps.app.goo.gl/FbCGkDM9Jj7Fn7GL8"}'::jsonb,
 '[
    {"days": ["sun"], "times": [{"start": "16:00", "end": "22:00", "note": "Ahad 4-10pm"}]}
  ]'::jsonb
),

-- Pasar Malam Kubang Kerian
('kota-bharu-kubang-kerian',
 'Pasar Malam Kubang Kerian',
 '15200 Kota Bharu, Kelantan',
 'Kota Bharu',
 'Kelantan',
 'Active',
 NULL,
 NULL, NULL,
 FALSE, FALSE, NULL,
 FALSE, FALSE,
 '{"latitude": 6.1030931463422755, "longitude": 102.27802482621101, "gmaps_link": "https://maps.app.goo.gl/38peF7wWtUnQVdCR8"}'::jsonb,
 '[
    {"days": ["fri"], "times": [{"start": "17:00", "end": "23:00", "note": "Jumaat 5-11pm"}]}
  ]'::jsonb
),

-- Pasar Malam Wakaf Bharu
('kota-bharu-wakaf-bharu',
 'Pasar Malam Wakaf Bharu',
 '16250 Wakaf Bharu, Kelantan',
 'Kota Bharu',
 'Kelantan',
 'Active',
 NULL,
 NULL, NULL,
 FALSE, FALSE, NULL,
 FALSE, FALSE,
 '{"latitude": 6.122983199819317, "longitude": 102.20122767067144, "gmaps_link": "https://maps.app.goo.gl/2HrrCHSyoMYCr86Q7"}'::jsonb,
 '[
    {"days": ["thu"], "times": [{"start": "17:00", "end": "23:00", "note": "Khamis 5-11pm"}]}
  ]'::jsonb
),

-- Street Bundle Night Market LHDN KB
('kota-bharu-street-bundle-night-market-lhdn-kb',
 'Street Bundle Night Market LHDN KB',
 '5444, Jalan Buluh Kubu, Bandar Kota Bharu, 15000 Kota Bharu, Kelantan',
 'Kota Bharu',
 'Kelantan',
 'Active',
 NULL,
 NULL, NULL,
 FALSE, FALSE, NULL,
 FALSE, FALSE,
 '{"latitude": 6.129854899535196, "longitude": 102.23703377055652, "gmaps_link": "https://maps.app.goo.gl/pF4Fp5HjCuSMVDY18"}'::jsonb,
 '[
    {"days": ["mon","tue","wed","thu","fri","sat","sun"], "times": [{"start": "20:00", "end": "01:00", "note": "Everyday 8pm-1am"}]}
  ]'::jsonb
),

-- Pasar Malam Morak
('kota-bharu-morak',
 'Pasar Malam Morak',
 'Kampung Gelong Perahu, 16250 Wakaf Bharu, Kelantan',
 'Kota Bharu',
 'Kelantan',
 'Active',
 NULL,
 NULL, NULL,
 FALSE, FALSE, NULL,
 FALSE, FALSE,
 '{"latitude": 6.137808866207983, "longitude": 102.21137082945204, "gmaps_link": "https://maps.app.goo.gl/i3MD46UTQmKggkct5"}'::jsonb,
 '[
    {"days": ["wed"], "times": [{"start": "17:00", "end": "23:00", "note": "Rabu 5-11pm"}]}
  ]'::jsonb
),

-- Medan Warisan Makanan & Agrotruck @ Dataran Bandaraya
('kota-bharu-dataran-bandaraya-medan-warisan',
 'Medan Warisan Makanan & Agrotruck @ Dataran Bandaraya',
 'Jalan Hospital, Bandar Kota Bharu, 15000 Kota Bahru, Kelantan',
 'Kota Bharu',
 'Kelantan',
 'Active',
 NULL,
 NULL, NULL,
 FALSE, FALSE, NULL,
 FALSE, FALSE,
 '{"latitude": 6.12553506603921, "longitude": 102.239273429452, "gmaps_link": "https://maps.app.goo.gl/itDoWHMar3eJdKiU7"}'::jsonb,
 '[
    {"days": ["mon","tue","wed","thu","fri","sat","sun"], "times": [{"start": "20:00", "end": "00:00", "note": "Everyday 8pm-12am"}]}
  ]'::jsonb
),

-- Pasar Malam Parit Dalam
('kota-bharu-parit-dalam',
 'Pasar Malam Parit Dalam',
 'Jalan Parit Dalam, Seksyen 8, 15000 Kota Bharu, Kelantan',
 'Kota Bharu',
 'Kelantan',
 'Active',
 NULL,
 NULL, NULL,
 FALSE, FALSE, NULL,
 FALSE, FALSE,
 '{"latitude": 6.129176099527558, "longitude": 102.24001512945203, "gmaps_link": "https://maps.app.goo.gl/9e5BKorGJNHGTwJ47"}'::jsonb,
 '[
    {"days": ["mon","tue","wed","thu","fri","sat","sun"], "times": [{"start": "20:00", "end": "00:00", "note": "Everyday 8pm-12am"}]}
  ]'::jsonb
),

-- Pasar Malam Taman Bendahara
('kota-bharu-taman-bendahara',
 'Pasar Malam Taman Bendahara',
 'Jalan Bendahara 2/36, Taman Bendahara, 16100 Kota Bharu, Kelantan',
 'Kota Bharu',
 'Kelantan',
 'Active',
 NULL,
 NULL, NULL,
 FALSE, FALSE, NULL,
 FALSE, FALSE,
 '{"latitude": 6.165501466631805, "longitude": 102.28136915276555, "gmaps_link": "https://maps.app.goo.gl/Gc8JMpgpQgrbfqtk7"}'::jsonb,
 '[
    {"days": ["sat"], "times": [{"start": "17:00", "end": "21:00", "note": "Sabtu 5-9pm"}]}
  ]'::jsonb
),

-- Pasar Malam Melor
('kota-bharu-melor',
 'Pasar Malam Melor, Kelantan.',
 'Pekan Melor, 16400 Melor, Kelantan',
 'Kota Bharu',
 'Kelantan',
 'Active',
 NULL,
 NULL, NULL,
 FALSE, FALSE, NULL,
 FALSE, FALSE,
 '{"latitude": 5.964477197700103, "longitude": 102.29596862945202, "gmaps_link": "https://maps.app.goo.gl/bCVqZooKCZcERWYk8"}'::jsonb,
 '[
    {"days": ["fri"], "times": [{"start": "17:00", "end": "23:00", "note": "Jumaat 5-11pm"}]}
  ]'::jsonb
),

-- Tapak pasar malam kg tepus
('kota-bharu-kg-tepus',
 'Tapak Pasar Malam Kg Tepus',
 'D13, Gunong, 16090 Kota Bharu, Kelantan',
 'Kota Bharu',
 'Kelantan',
 'Active',
 NULL,
 NULL, NULL,
 FALSE, FALSE, NULL,
 FALSE, FALSE,
 '{"latitude": 5.997435796769766, "longitude": 102.34063614724299, "gmaps_link": "https://maps.app.goo.gl/LFuREjhMx53ShNvV6"}'::jsonb,
 '[
    {"days": ["thu"], "times": [{"start": "16:00", "end": "21:00", "note": "Khamis 4-9pm"}]}
  ]'::jsonb
),

-- Pasar Malam dan Pasar Pagi Dewan Beta
('kota-bharu-dewan-beta',
 'Pasar Malam dan Pasar Pagi Dewan Beta',
 'Jalan Dewan Beta, Kota Bharu, 15100, Kelantan',
 'Kota Bharu',
 'Kelantan',
 'Active',
 NULL,
 NULL, NULL,
 FALSE, FALSE, NULL,
 FALSE, FALSE,
 '{"latitude": 6.01508819651286, "longitude": 102.20587050553114, "gmaps_link": "https://maps.app.goo.gl/seufqvkW8AUkA8W59"}'::jsonb,
 '[
    {"days": ["mon","wed","fri"], "times": [{"start": "16:00", "end": "21:00", "note": "Isnin, Rabu, Jumaat 4-9pm"}]}
  ]'::jsonb
),

-- Pasar Karat Kota Bharu
('kota-bharu-pasar-karat',
 'Pasar Karat Kota Bharu',
 'Pasar Siti Khadijah, Bandar Kota Bharu, 15000 Kota Bharu, Kelantan',
 'Kota Bharu',
 'Kelantan',
 'Active',
 NULL,
 NULL, NULL,
 FALSE, FALSE, NULL,
 FALSE, FALSE,
 '{"latitude": 6.129786765942445, "longitude": 102.23853569448596, "gmaps_link": "https://maps.app.goo.gl/biJkpgPkY42N3bSMA"}'::jsonb,
 '[
    {"days": ["thu","fri"], "times": [{"start": "19:00", "end": "00:00", "note": "Khamis, Jumaat 7pm-12am"}]}
  ]'::jsonb
),

-- Pasar Malam Jamekyah Pasir Mas
('pasir-mas-jamekyah',
 'Pasar Malam Jamekyah Pasir Mas',
 'Pasar Malam Jamekyah, Pekan Pasir Mas, 17000 Pasir Mas, Kelantan',
 'Pasir Mas',
 'Kelantan',
 'Active',
 NULL,
 NULL, NULL,
 FALSE, FALSE, NULL,
 FALSE, FALSE,
 '{"latitude": 6.0433163056538755, "longitude": 102.14454227113471, "gmaps_link": "https://maps.app.goo.gl/6XhBeu1PBijrMjPc6"}'::jsonb,
 '[
    {"days": ["wed"], "times": [{"start": "17:00", "end": "21:00", "note": "Rabu 5-9pm"}]}
  ]'::jsonb
),

-- Pasar Malam Repek (no day/time provided)
('pasir-mas-repek',
 'Pasar Malam Repek',
 'Tiong Chandi, D23, Jalan Pohon Tanjong, Kampung Repek, 17000 Pasir Mas, Kelantan',
 'Pasir Mas',
 'Kelantan',
 'Active',
 NULL,
 NULL, NULL,
 FALSE, FALSE, NULL,
 FALSE, FALSE,
 '{"latitude": 6.02654597238888, "longitude": 102.09549950127077, "gmaps_link": "https://maps.app.goo.gl/HiENFnzcY6HRLYTx7"}'::jsonb,
 '[]'::jsonb
),

-- Pasar Malam To'Uban
('pasir-mas-to-uban',
 'Pasar Malam To''Uban',
 '17040, D186, 17040 Pasir Mas, Kelantan',
 'Pasir Mas',
 'Kelantan',
 'Active',
 NULL,
 NULL, NULL,
 FALSE, FALSE, NULL,
 FALSE, FALSE,
 '{"latitude": 5.965295393167569, "longitude": 102.14425999141064, "gmaps_link": "https://maps.app.goo.gl/nJ9ASwRs14eBVcQn9"}'::jsonb,
 '[
    {"days": ["mon"], "times": [{"start": "17:00", "end": "22:00", "note": "Isnin 5-10pm"}]}
  ]'::jsonb
),

-- Tapak Pasar Pagi/Pasar Malam Kg Bakong/Pohon Tanjong (no day/time)
('pasir-mas-kg-bakong-pohon-tanjong',
 'Tapak Pasar Pagi/Pasar Malam Kg Bakong/Pohon Tanjong',
 'D23, Kampung Pohon Taniong, 17000 Pasir Mas, Kelantan',
 'Pasir Mas',
 'Kelantan',
 'Active',
 NULL,
 NULL, NULL,
 FALSE, FALSE, NULL,
 FALSE, FALSE,
 '{"latitude": 6.0741079566871825, "longitude": 102.0818326685134, "gmaps_link": "https://maps.app.goo.gl/qDqzWtaWyQfAJxcV9"}'::jsonb,
 '[]'::jsonb
),

-- Pasar Malam Buluh Kubu (Pasir Mas entry text but address is KB)
('pasir-mas-buluh-kubu',
 'Pasar Malam Buluh Kubu',
 'Jalan Maahad, Bandar Kota Bharu, 15000 Kota Bharu, Kelantan',
 'Pasir Mas',
 'Kelantan',
 'Active',
 NULL,
 NULL, NULL,
 FALSE, FALSE, NULL,
 FALSE, FALSE,
 '{"latitude": 6.132017308086031, "longitude": 102.24011985661377, "gmaps_link": "https://maps.app.goo.gl/1Zp1f73BvNGF6HaHA"}'::jsonb,
 '[
    {"days": ["mon","tue","wed","thu","fri","sat","sun"], "times": [{"start": "08:00", "end": "22:00", "note": "Everyday 8am-10pm"}]}
  ]'::jsonb
),

-- Pasar petang kubang kuau (no day/time)
('pasir-mas-kubang-kuau',
 'Pasar Petang Kubang Kuau',
 '17200 Pasir Mas, Kelantan',
 'Pasir Mas',
 'Kelantan',
 'Active',
 NULL,
 NULL, NULL,
 FALSE, FALSE, NULL,
 FALSE, FALSE,
 '{"latitude": 5.968416206302157, "longitude": 102.01555867159315, "gmaps_link": "https://maps.app.goo.gl/Bz1XtUqwwE4EKe2o9"}'::jsonb,
 '[]'::jsonb
),

-- Pasar Malam Tok Bali (note: Tok Bali is in Pasir Puteh)
('pasir-mas-tok-bali',
 'Pasar Malam Tok Bali',
 '16700 Pasir Puteh, Kelantan',
 'Pasir Mas',
 'Kelantan',
 'Active',
 NULL,
 NULL, NULL,
 FALSE, FALSE, NULL,
 FALSE, FALSE,
 '{"latitude": 5.889433314787079, "longitude": 102.48296842023548, "gmaps_link": "https://maps.app.goo.gl/sP6AdY4gbZLTuTN7A"}'::jsonb,
 '[
    {"days": ["thu"], "times": [{"start": "18:00", "end": "00:00", "note": "Khamis 6pm-12am"}]}
  ]'::jsonb
),

-- Pasar Malam Felcra Teratak Batu
('pasir-mas-felcra-teratak-batu',
 'Pasar Malam Felcra Teratak Batu',
 'Jalan Utama, Felcra Teratak Batu, 16800 Pasir Puteh, Kelantan',
 'Pasir Mas',
 'Kelantan',
 'Active',
 NULL,
 NULL, NULL,
 FALSE, FALSE, NULL,
 FALSE, FALSE,
 '{"latitude": 5.760518969940503, "longitude": 102.33786949484399, "gmaps_link": "https://maps.app.goo.gl/i5f8e4RkNXTf792P6"}'::jsonb,
 '[
    {"days": ["fri"], "times": [{"start": "17:00", "end": "21:00", "note": "Jumaat 5-9pm"}]}
  ]'::jsonb
),

-- Pasar Malam Pasir Puteh
('pasir-mas-pasir-puteh',
 'Pasar Malam Pasir Puteh',
 '16800 Pasir Puteh, Kelantan',
 'Pasir Mas',
 'Kelantan',
 'Active',
 NULL,
 NULL, NULL,
 FALSE, FALSE, NULL,
 FALSE, FALSE,
 '{"latitude": 5.828228679522845, "longitude": 102.40355442833308, "gmaps_link": "https://maps.app.goo.gl/vu1inccXXc52A8YU6"}'::jsonb,
 '[
    {"days": ["tue","sat"], "times": [{"start": "17:00", "end": "22:00", "note": "Selasa, Sabtu 5-10pm"}]}
  ]'::jsonb
),

-- Pasar Malam Irama Beach
('bachok-irama-beach',
 'Pasar Malam Irama Beach',
 '20, 189, 16300 Bachok, Kelantan',
 'Bachok',
 'Kelantan',
 'Active',
 NULL,
 NULL, NULL,
 FALSE, FALSE, NULL,
 FALSE, FALSE,
 '{"latitude": 6.063064962958281, "longitude": 102.4011161281441, "gmaps_link": "https://maps.app.goo.gl/wNimesoJQFbiHJTi6"}'::jsonb,
 '[
    {"days": ["fri"], "times": [{"start": "18:00", "end": "22:00", "note": "Jumaat 6-10pm"}]}
  ]'::jsonb
),

-- Pasar Malam Machang
('machang-bandar-machang',
 'Pasar Malam Machang',
 'Jalan Pejabat, Pekan Machang, 18500 Bandar Machang, Kelantan',
 'Machang',
 'Kelantan',
 'Active',
 NULL,
 NULL, NULL,
 FALSE, FALSE, NULL,
 FALSE, FALSE,
 '{"latitude": 5.767224900927877, "longitude": 102.21647434245325, "gmaps_link": "https://maps.app.goo.gl/Eahz8pmSNdQkX4ub7"}'::jsonb,
 '[
    {"days": ["fri"], "times": [{"start": "16:00", "end": "22:00", "note": "Jumaat 4-10pm"}]}
  ]'::jsonb
),

-- Pasar Malam Mukim Baka
('machang-mukim-baka',
 'Pasar Malam Mukim Baka',
 'Jln Bukit Bakar, Kampung Ayer Merah, 18500 Bandar Machang, Kelantan',
 'Machang',
 'Kelantan',
 'Active',
 NULL,
 NULL, NULL,
 FALSE, FALSE, NULL,
 FALSE, FALSE,
 '{"latitude": 5.740382109136582, "longitude": 102.24149997710505, "gmaps_link": "https://maps.app.goo.gl/fs3ZpyEWNjiMmQQy8"}'::jsonb,
 '[
    {"days": ["wed"], "times": [{"start": "17:00", "end": "22:00", "note": "Rabu 5-10pm"}]}
  ]'::jsonb
),

-- Pasar Malam Batu Gajah
('tanah-merah-batu-gajah',
 'Pasar Malam Batu Gajah',
 'Kampung Banggol Jering, 17700 Tanah Merah, Kelantan',
 'Tanah Merah',
 'Kelantan',
 'Active',
 NULL,
 NULL, NULL,
 FALSE, FALSE, NULL,
 FALSE, FALSE,
 '{"latitude": 5.8115721992779354, "longitude": 101.97973884990998, "gmaps_link": "https://maps.app.goo.gl/3vxrKXYzjwBm7A5r7"}'::jsonb,
 '[
    {"days": ["sun"], "times": [{"start": "17:00", "end": "22:00", "note": "Ahad 5-10pm"}]}
  ]'::jsonb
),

-- Pasar Malam Cina (Kuala Krai)
('kuala-krai-pasar-malam-cina',
 'Pasar Malam Cina',
 '211, Jalan Ah Sang, Pekan Kuala Krai, 18000 Kuala Krai, Kelantan',
 'Kuala Krai',
 'Kelantan',
 'Active',
 NULL,
 NULL, NULL,
 FALSE, FALSE, NULL,
 FALSE, FALSE,
 '{"latitude": 5.53165379783327, "longitude": 102.1999770625137, "gmaps_link": "https://maps.app.goo.gl/qx5ny9NbkDmLL7Wh6"}'::jsonb,
 '[
    {"days": ["wed"], "times": [{"start": "17:00", "end": "23:00", "note": "Rabu 5-11pm"}]}
  ]'::jsonb
),

-- Uptown Medan Warisan Makanan Kelantan
('kuala-krai-uptown-medan-warisan',
 'Uptown Medan Warisan Makanan Kelantan',
 'PT 3454, Jalan Pahi, Pekan Kuala Krai, 18000 Kuala Krai, Kelantan',
 'Kuala Krai',
 'Kelantan',
 'Active',
 NULL,
 NULL, NULL,
 FALSE, FALSE, NULL,
 FALSE, FALSE,
 '{"latitude": 5.54233459477649, "longitude": 102.20360109759316, "gmaps_link": "https://maps.app.goo.gl/7cc2vYxJBkFEVebu7"}'::jsonb,
 '[
    {"days": ["mon","tue","thu","sat","sun"], "times": [{"start": "18:00", "end": "00:00", "note": "Isnin, Selasa, Khamis, Sabtu, Ahad 6pm-12am"}]}
  ]'::jsonb
),

-- Pasar Malam Bandar Utama Gua Musang
('gua-musang-bandar-utama',
 'Pasar Malam Bandar Utama Gua Musang',
 '18300 Gua Musang, Kelantan',
 'Gua Musang',
 'Kelantan',
 'Active',
 NULL,
 NULL, NULL,
 FALSE, FALSE, NULL,
 FALSE, FALSE,
 '{"latitude": 4.8994041553738725, "longitude": 101.97407103758732, "gmaps_link": "https://maps.app.goo.gl/hpfbtkf7uBPPSa6f8"}'::jsonb,
 '[
    {"days": ["tue"], "times": [{"start": "16:00", "end": "22:00", "note": "Selasa 4-10pm"}]}
  ]'::jsonb
),

-- Pasar Malam Taman Tropika
('gua-musang-taman-tropika',
 'Pasar Malam Taman Tropika',
 '18300 Gua Musang, Kelantan',
 'Gua Musang',
 'Kelantan',
 'Active',
 NULL,
 NULL, NULL,
 FALSE, FALSE, NULL,
 FALSE, FALSE,
 '{"latitude": 4.871734487673955, "longitude": 101.95248254680793, "gmaps_link": "https://maps.app.goo.gl/QJeEPMMBf7xYYXSP9"}'::jsonb,
 '[
    {"days": ["sun"], "times": [{"start": "17:00", "end": "22:00", "note": "Ahad 5-10pm"}]}
  ]'::jsonb
),

-- Pasar Malam Bandar Baru Gua Musang
('gua-musang-bandar-baru',
 'Pasar Malam Bandar Baru Gua Musang',
 'Sebelah Pejabat Majlis Daerah Gua Musang, Kelantan 18300 Gua Musang, Malaysia',
 'Gua Musang',
 'Kelantan',
 'Active',
 NULL,
 NULL, NULL,
 FALSE, FALSE, NULL,
 FALSE, FALSE,
 '{"latitude": 4.86117093136577, "longitude": 101.95766152264908, "gmaps_link": "https://maps.app.goo.gl/nvyvzrFrxsLLTMPb6"}'::jsonb,
 '[
    {"days": ["thu","fri"], "times": [
      {"start": "16:00", "end": "23:00", "note": "4-11pm"},
      {"start": "07:00", "end": "11:00", "note": "7am-11am"}
    ]}
  ]'::jsonb
),

-- Tapak Pasar Malam Lojing
('lojing-tapak-pasar-malam',
 'Tapak Pasar Malam Lojing',
 '18300 Lojing Highlands, Kelantan',
 'Lojing',
 'Kelantan',
 'Active',
 NULL,
 NULL, NULL,
 FALSE, FALSE, NULL,
 FALSE, FALSE,
 '{"latitude": 4.623292450147868, "longitude": 101.45643327301607, "gmaps_link": "https://maps.app.goo.gl/zSfPtBvHLBhjkJa86"}'::jsonb,
 '[
    {"days": ["thu"], "times": [{"start": "16:00", "end": "19:00", "note": "Khamis 4-7pm"}]}
  ]'::jsonb
)
ON CONFLICT (id) DO NOTHING;