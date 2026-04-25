#!/usr/bin/env node
/**
 * Seeds 100 realistic posts using the Supabase service_role key.
 * Run:
 *   SUPABASE_SERVICE_ROLE_KEY=... node --env-file=.env scripts/seed-posts.mjs
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing EXPO_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const ADMIN_EMAILS = [
  'admin@campfire.app',
  'minjae@campfire.app',
  'alex@campfire.app',
  'lynn@campfire.app',
  'doyeon@campfire.app',
  'namin@campfire.app',
];

// Resolve user ids
const { data: list, error: listErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
if (listErr) {
  console.error('listUsers failed:', listErr.message);
  process.exit(1);
}
const idByEmail = new Map();
list.users.forEach((u) => { if (u.email) idByEmail.set(u.email, u.id); });
const userIds = ADMIN_EMAILS.map((e) => idByEmail.get(e)).filter(Boolean);
if (userIds.length === 0) {
  console.error('No seed users found. Did you create admins?');
  process.exit(1);
}

const POSTS = [
  // === Class tips ===
  { c: 'Class tips', v: 'Columbia', t: 'COMS 1004 Adam Cannon 강추', b: '첫 CS 수업이면 무조건 Cannon 교수님. 설명도 천천히, office hour 가면 진짜 친절. 책 안 사도 됨.' },
  { c: 'Class tips', v: 'NYU', t: 'Easy A: Intro to Cinema Studies', b: 'CINE-UT 101 들었는데 영화 보고 1페이지 reflection 쓰는게 다임. 출석만 챙기면 A 가능.' },
  { c: 'Class tips', v: 'Parsons', t: 'Fashion Design Studio I 후기', b: 'Studio가 진짜 빡센데 Pia 교수님 만나면 행복함. critique session에서 솔직한 피드백.' },
  { c: 'Class tips', v: 'SVA', t: 'Animation 시작하는 사람들', b: 'Visual Narrative 듣기 전에 꼭 Drawing for Animators 먼저. 안 들으면 따라가기 힘듦.' },
  { c: 'Class tips', v: 'Cooper Union', t: 'EE 101 시험 팁', b: 'Midterm은 problem set이랑 거의 똑같이 나옴. 끝까지 풀어보기. final은 cumulative.' },
  { c: 'Class tips', v: 'FIT', t: 'Textile Science 안 들어도 됨', b: '들어봤는데 lab safety quiz 밖에 기억 안 남. 졸업요건 아니면 다른거 들으세요.' },
  { c: 'Class tips', v: 'Columbia', t: 'Frontiers of Science 후기', b: 'Core 중에 unpopular한 그건데 막상 들으면 의외로 재밌음. final은 reading 위주.' },
  { c: 'Class tips', v: 'NYU', t: 'Calc I 어떤 교수가 좋아요?', b: 'spring 등록인데 rate my professor 봐도 의견 갈려서. Stern 1년차 econ 전공입니다.' },
  { c: 'Class tips', v: 'All campuses', t: 'Coursera 듣고 학점 변환 가능?', b: '여름방학에 stats 듣고 학점인정 받고 싶은데 NYU나 Columbia 어떻게 처리하나요?' },
  { c: 'Class tips', v: 'Parsons', t: 'Color Workshop 꼭 들으세요', b: 'fashion이든 illustration이든 진짜 도움됨. portfolio 퀄 차이 많이 남.' },
  { c: 'Class tips', v: 'SVA', t: 'Photography 1 카메라 추천', b: '1학년 photo class인데 Canon Rebel T7 정도면 충분한가요? 중고로 사는게 좋을지.' },
  { c: 'Class tips', v: 'NYU', t: 'Macroeconomics 교수 비교', b: 'Sahin vs. Caplin. Caplin이 시험 쉬움, Sahin은 lecture가 좋음. trade-off 있음.' },
  { c: 'Class tips', v: 'Columbia', t: 'University Writing 어렵나요?', b: '글쓰기 약한 international이고 첫 학기인데 부담. 일주일에 몇 페이지씩 쓰나요?' },
  { c: 'Class tips', v: 'Cooper Union', t: 'Common Hour 활용 잘 하세요', b: '월수금 12-1pm Common Hour인데 study group 만들기 좋음. 이때 모여서 problem set 풉니다.' },
  { c: 'Class tips', v: 'FIT', t: 'Photography I 강사 추천', b: 'Prof. Greene. equipment 빌려주는 것도 자세히, critique이 진짜 honest.' },
  { c: 'Class tips', v: 'All campuses', t: 'Korean class 같이 들을 분', b: 'NYU 한국어 4 듣는데 다른 학교 분들도 들을 수 있나요? 같이 study group 하실 분.' },
  { c: 'Class tips', v: 'Parsons', t: 'Drawing 1 세 시간 너무 길어요', b: '집중력 어떻게 유지하시나요? 두 시간 지나면 멍해짐. 팁 좀.' },
  { c: 'Class tips', v: 'NYU', t: 'Linguistics 101 추천', b: 'GenEd 채울거 찾는 사람들한테 강추. 시험 quiz 7개 + final. group project 없음.' },

  // === Sublets / Roommates ===
  { c: 'Sublets', v: 'All campuses', t: '[Sublet] East Village 1bd $1850 5/15-8/15', b: '1st Ave & 7th St. 침실 따로, 거실, 햇빛 잘 들어옴. furnished. 인스타 @ev_sublet_2026 DM.' },
  { c: 'Sublets', v: 'All campuses', t: 'Looking for female roommate Morningside', b: 'Columbia 학생, 4 bedroom share 1자리. private room $1450, util incl. 6/1 입주.' },
  { c: 'Sublets', v: 'NYU', t: 'Palladium 1자리 찾아요', b: '룸메 한 명 빠져서 Palladium 4인실 1자리 sublet. spring 마지막 달까지. utility free.' },
  { c: 'Sublets', v: 'Columbia', t: 'EC quad → off-campus 옮기시는 분', b: 'EC quad 쓰던 사람인데 전세 빠짐. 마지막 한 달 보증금 deal 가능. DM 주세요.' },
  { c: 'Sublets', v: 'All campuses', t: '[QUICK] Bushwick 2bd 6월부터 1년', b: 'Bushwick L train 5분 Jefferson 역. 본인 + 남자 룸메 + 고양이. private $1100.' },
  { c: 'Sublets', v: 'All campuses', t: '단기 sublet 가능? 5월 한 달', b: 'finals 끝나고 5/1-31일까지만. Manhattan or close BK. budget $1500 max.' },
  { c: 'Sublets', v: 'Parsons', t: 'Stuyvesant Town 본인 방 sublet', b: 'studio 절반 partition으로 나눠 쓰는 형태. 본인 cat-friendly. 5-8월. $900/month.' },
  { c: 'Sublets', v: 'All campuses', t: '한인 룸메이트 구해요 Hell\'s Kitchen', b: '36th & 9th, 2bd 풀가전. 본인 NYU Stern 1년차 깔끔. 비흡연자, 음식 잘 만드는 분.' },
  { c: 'Sublets', v: 'SVA', t: 'Ludlow Residence 자리 빠짐', b: 'SVA Ludlow 더블룸 한 자리 fall부터. 보증금 $500. studio art 학생.' },
  { c: 'Sublets', v: 'All campuses', t: '가구 처분 (이사 가요)', b: 'IKEA 책상 $30, 의자 $15, full size 매트리스 $80, 옷장 무료. 5/20부터 픽업. Astoria.' },
  { c: 'Sublets', v: 'Cooper Union', t: '29 3rd Ave 기숙사 6월 sublet', b: '여름 인턴 가서 6/1-8/15 sublet 가능. private room. $1200 OBO.' },
  { c: 'Sublets', v: 'FIT', t: 'Coed Residence 보증금 양도', b: 'fall 들어가는데 보증금 양도하실 분. 직접 만나서 paperwork.' },
  { c: 'Sublets', v: 'All campuses', t: 'Williamsburg 4bd 1자리', b: 'McCarren Park 옆. 룸메 4명 (3 NYU, 1 Parsons). private room $1400. 좋은 vibe.' },
  { c: 'Sublets', v: 'All campuses', t: '여름 sublet 사진 + 가격 정리', b: '저희 그룹챗에서 정리한 sublet 리스트 있어요. 댓글로 학교 + 비번 알려주시면 공유.' },
  { c: 'Sublets', v: 'Columbia', t: 'Riverside Drive 110st 자리', b: 'Columbia 5min walk. 1자리 male roommate. private $1350 incl. utility & wifi. 9월부터.' },
  { c: 'Sublets', v: 'NYU', t: '14th St 24/7 보안 building', b: 'doorman building이고 gym 있어요. 1자리. NYU 학생이면 lease takeover.' },

  // === Lifestyle / Restaurants ===
  { c: 'All', v: 'All campuses', t: '32가에 새로 생긴 분식집 ㄹㅇ 맛있음', b: '굴튀김 김밥집 Kkanbu 옆. 떡볶이 $9에 푸짐. 인스타 @bunsik_nyc' },
  { c: 'All', v: 'All campuses', t: 'East Village 한국식 디저트 추천', b: 'Spot Dessert 외에 갈만한 곳? 빙수 먹고 싶은데 32가는 사람 너무 많음.' },
  { c: 'All', v: 'NYU', t: 'Bobst 옆 카페 추천', b: 'Think Coffee 말고 study하기 좋은 카페? wifi 빠르고 자리 많은 곳.' },
  { c: 'All', v: 'Columbia', t: 'Hungarian Pastry Shop go-to 메뉴', b: 'cherry strudel + cappuccino 강추. 시험기간엔 자리 없음.' },
  { c: 'All', v: 'All campuses', t: 'K-BBQ 4명 $80 이하 어디?', b: '주말에 친구들이랑 가고 싶은데 deal 있는 곳 알려주세요.' },
  { c: 'All', v: 'All campuses', t: 'Trader Joe\'s 32가 추천템 공유', b: '저는 frozen kimchi mandoo, oat milk, peanut butter cups 무한 reorder. 너네는?' },
  { c: 'All', v: 'Parsons', t: 'Soho 한식 happy hour 있는 곳?', b: 'critique 끝나고 술 + 안주 cheap한 곳 찾아요. 월~목 5-7pm.' },
  { c: 'All', v: 'All campuses', t: '인스타 @nyc_korean_food 만들었어요', b: '뉴욕 한식당 직접 후기. 팔로우 부탁드려요. 추천 받으면 reply 합니다.' },
  { c: 'All', v: 'All campuses', t: '제 작업물 보러와주세요 @doyeon.draws', b: '드로잉이랑 zine 작업. 학생 commission 받습니다. DM open.' },
  { c: 'All', v: 'All campuses', t: 'Boba 어디가 best?', b: 'Kung Fu Tea, Tiger Sugar, Gong Cha 다 가봤는데 K Fresh도 의외로 괜찮음.' },
  { c: 'All', v: 'NYU', t: 'Greenwich Village 산책 spot', b: 'Washington Square Park 말고 데이트하기 좋은 곳? 여친 와서 같이 다녀야해서.' },
  { c: 'All', v: 'All campuses', t: '32가 노래방 어디가 좋아요', b: 'Karaoke City vs Insa vs 5 Bar. 가격이랑 곡 selection 비교해주실 분.' },
  { c: 'All', v: 'All campuses', t: '아 또 ramen 먹고싶다', b: 'Ippudo 1시간 wait. Totto 도 비슷. 안 막히는 라멘집 추천.' },
  { c: 'All', v: 'Columbia', t: 'Morningside 김밥/도시락 배달', b: 'UWS 한식 delivery 진짜 답답한데 알려주세요. UberEats 외 service.' },
  { c: 'All', v: 'All campuses', t: '뉴욕 와서 처음 먹은 한식 ㅋㅋ', b: '저는 32가 강서면옥. 너네는?' },

  // === Insta promo / self promo ===
  { c: 'All', v: 'All campuses', t: '인스타 팔로우 부탁드려요 @lynn.nyc', b: 'NYC daily life + 사진. 한국학생들 많이 follow해서 친목할 사람 찾아요.' },
  { c: 'All', v: 'All campuses', t: '제 댄스 콜라보 봐주세요', b: '@minjae.kk 인스타. KSA showcase 끝나고 친구랑 cover 찍었음. 좋아요 부탁.' },
  { c: 'All', v: 'Parsons', t: '졸업작품 영상 공개 (link in bio)', b: 'Parsons fashion BFA thesis. Vimeo에 공개했어요 @sosohoshow' },
  { c: 'All', v: 'All campuses', t: '카메라 들고 다니는 사람 찾아요', b: 'film photo zine 만드는데 모델/같이 찍을 분. unpaid but credit + zine 1부.' },
  { c: 'All', v: 'SVA', t: 'illustrator portfolio 봐주실 분', b: '@alex.illust IG. 1년 모은 거 처음 publish해서 honest feedback 절실.' },
  { c: 'All', v: 'All campuses', t: '뉴욕 일상 vlog 시작했어요', b: '유튜브 @namin_inny 첫 영상 올림. 32가 hopping vlog. 구독 부탁!' },
  { c: 'All', v: 'NYU', t: 'student startup 베타 테스터 모집', b: 'NYU 학생들 study group matching 앱. 베타 가입하면 굿즈 + 우선 access.' },
  { c: 'All', v: 'All campuses', t: '커미션 받아요 (digital portrait)', b: '$30 head only / $60 half body. 1주일 turnaround. 인스타 @doyeon.art DM.' },
  { c: 'All', v: 'All campuses', t: 'TikTok 친한 한국학생 알려주세요', b: '뉴욕에서 활동하는 한국학생 TikToker 모음 만들고 있어요. 본인이거나 추천.' },
  { c: 'All', v: 'All campuses', t: '저 책 냈어요 (zine)', b: 'self-publish한 zine 25부 한정. $15. 32가 카페 픽업 가능. DM 주세요.' },
  { c: 'All', v: 'FIT', t: 'FIT student designer 인스타 모음', b: 'FIT 한국 디자이너들 portfolio 정리한 spreadsheet. 댓글로 본인거 추가 환영.' },
  { c: 'All', v: 'All campuses', t: '제 디자인 스튜디오 launch 했어요', b: 'graphic + branding studio. 학생 special rate. portfolio link in bio @studio.h0me' },

  // === KSA / Events ===
  { c: 'KSA', v: 'Columbia', t: 'KSA Spring Formal 4/26 (Saturday)', b: 'Columbia KSA Spring Formal 다음 주 토. dress code semi-formal. ticket $40 (member $30). DM.' },
  { c: 'KSA', v: 'NYU', t: 'NYU KSA 신학기 회비 안내', b: 'spring due date 4/30. Venmo @nyu-ksa-fund. paid 명단 공지방.' },
  { c: 'KSA', v: 'NYU', t: 'KSA general body meeting 4/24', b: 'Bobst LL150 이번 주 목요일 7pm. 행사 vote랑 next president 후보. 간식 있음.' },
  { c: 'KSA', v: 'Parsons', t: 'Parsons KSA 첫 모임 후기', b: '이번 학기 시작했어요. 다음 모임 5/2 7pm at 63 5th Ave. 신입 환영.' },
  { c: 'KSA', v: 'All campuses', t: '뉴욕 한인학생회 연합 picnic', b: '5/4 Sun Central Park Sheep Meadow. 음식 potluck. 학교당 5명씩 RSVP.' },
  { c: 'Events', v: 'All campuses', t: '한국 영화제 IFC center 5/10', b: 'IFC Center에서 K-film festival. 박찬욱 retrospective. ticket $13 student.' },
  { c: 'Events', v: 'All campuses', t: 'KSA Game Night 4/27 (Sun)', b: 'Mahjong, 카드, 마니또 게임 준비. NYU 학생회관 7-10pm. 무료, 음료 제공.' },
  { c: 'Events', v: 'Columbia', t: '주말 산행 같이 가실 분', b: 'Bear Mountain 토요일. 8am Port Authority. 점심 김밥. ~10명.' },
  { c: 'Events', v: 'All campuses', t: '한국 가수 콘서트 같이 갈 분', b: '5/15 Forest Hills Stadium. 티켓 잡았는데 친구 못감. resale 같이?' },
  { c: 'Events', v: 'All campuses', t: 'Han River-style picnic Pier 25', b: '한강처럼 chill하게 piknic. 5/3 토 1pm. BYO food. 비 오면 cancel.' },
  { c: 'Events', v: 'NYU', t: 'NYU 한인학생 brunch 4/28', b: 'Joe & The Juice Union Square 11am. RSVP 댓글로. 처음 오시는 분도 환영.' },
  { c: 'KSA', v: 'SVA', t: 'SVA KSA 멤버 모집', b: '아직 작은 그룹이지만 weekly figure drawing + 한식 모임. DM @sva.ksa' },
  { c: 'Events', v: 'All campuses', t: '한국식당 투어 5/1', b: '32가 4군데 hopping 같이 할 분 4명 더. 6:30pm meet at K-Town arch.' },
  { c: 'Events', v: 'All campuses', t: 'Open mic at Sing Sing K-town', b: '5/9 Fri 9pm. K-pop / 발라드 / 자작곡 환영. signup 링크 댓글.' },
  { c: 'Events', v: 'FIT', t: 'FIT Korean student showcase', b: '5/12 portfolio show. 졸업생들 작품. 학생회 카드 가져오면 free entry.' },

  // === Clubs ===
  { c: 'Clubs', v: 'NYU', t: 'NYU dance team Kollaboration audition', b: 'spring audition 5/3 Sat. K-pop choreo. 한 달 빡세지만 진짜 재밌음. info 4/26.' },
  { c: 'Clubs', v: 'All campuses', t: 'Korean book club 신입 모집', b: '월 2회 Sunday brunch 모임. 한국어 소설 읽고 토론. 다음 책 정세랑.' },
  { c: 'Clubs', v: 'Columbia', t: 'CU film society Korean cinema night', b: '월 1회 한국영화 상영 + discussion. next 4/30 Burnett 102 7pm.' },
  { c: 'Clubs', v: 'All campuses', t: 'NY Korean student startup club', b: 'biweekly meetup. 사이드 프로젝트 발표 + 피드백. 다음 모임 The Wing Soho.' },
  { c: 'Clubs', v: 'SVA', t: 'SVA Animation Club', b: '매주 화요일 Common Room screening. 학생 작품 공유. 한국학생도 환영.' },
  { c: 'Clubs', v: 'NYU', t: 'NYU Hapkido 한국학생 환영', b: '화목 8pm Coles. trial 2번 무료. 한국학생 senior 5명 정도.' },
  { c: 'Clubs', v: 'All campuses', t: 'photographer collective 모집', b: '월 1회 photowalk + 매월 zine. instax / 35mm / digital 환영.' },
  { c: 'Clubs', v: 'Parsons', t: 'Parsons Sustainability Lab', b: '매주 수 6pm. textile recycling 프로젝트. 다른 학교 학생도 collab.' },

  // === School community / Logistics ===
  { c: 'School community', v: 'NYU', t: 'Bobst 24/7 다시 시작?', b: 'finals 다가오는데 Bobst 24h open 언제 시작? 친구가 모름.' },
  { c: 'School community', v: 'Columbia', t: 'Butler 자리 잡는 팁', b: '2층 north reading room 7am 가면 자리 잡을 수 있음. 6층은 microwave 때문에 항상 사람 많음.' },
  { c: 'School community', v: 'NYU', t: 'NYU course registration 5/5', b: 'spring 이번 주에 registration 열려요. shopping cart 미리 채워두기. waitlist 활용.' },
  { c: 'School community', v: 'Parsons', t: 'Parsons studio access hours', b: 'studio 24h인데 weekend swipe 안 먹어요. Aravena room 어떻게 들어가요?' },
  { c: 'School community', v: 'Cooper Union', t: 'Cooper Union 인쇄 무료?', b: 'foundation 3층 인쇄실 한 학기 200매 free. 그 이후 $0.10/page.' },
  { c: 'School community', v: 'FIT', t: 'FIT D building 옷 보관 locker', b: 'D building lockers 신청 어떻게 하나요? 매 학기 갱신?' },
  { c: 'School community', v: 'SVA', t: 'SVA equipment cage 운영시간', b: '23rd St 8AM-10PM, 21st St 9AM-9PM. weekend 늦게 닫음. equipment hold 24h.' },
  { c: 'School community', v: 'Columbia', t: 'Lerner mailroom packing tape', b: 'mailroom에서 박스 + 테이프 판매. 카드만 받음. 이사철에 line 길어요.' },
  { c: 'School community', v: 'NYU', t: 'NYU shuttle bus 추천 routes', b: 'A bus는 너무 사람 많고 E bus 타면 dorm까지 빠름. weekend 운행 짧음.' },
  { c: 'School community', v: 'All campuses', t: 'CUNY card 사용해서 met museum free?', b: '아무 NYC student id 가져가면 met museum suggested donation 적용 가능?' },

  // === Misc / Lost & Found / Help ===
  { c: 'All', v: 'All campuses', t: '잃어버렸어요 — silver hoop earring', b: '32가 한식당 NJ Coffee 옆 화장실에서 한 쪽 잃어버렸어요. 의미있어서 찾아요 ㅠ' },
  { c: 'All', v: 'NYU', t: '아이폰 케이스 누가 주웠어요?', b: '4/22 화 Bobst 4층 카페테리아. clear case + 사진 한 장. 보신 분 DM.' },
  { c: 'All', v: 'All campuses', t: '같이 헬스 갈 분 (Equinox 학생)', b: '34th St Equinox. 평일 저녁 7-9pm. 같이 갈 분 한 명.' },
  { c: 'All', v: 'All campuses', t: '재밌는 알바 / 일거리 있어요?', b: 'spring 끝나고 인턴 못 잡아서 일자리 절실. 한식당/카페/디자인 무관. 한국어 native.' },
  { c: 'All', v: 'All campuses', t: '뉴욕 운전면허 어디서 따요?', b: 'CT, NJ에서 잠깐 따고 NY로 transfer. NY DMV 절차 아시는 분.' },
  { c: 'All', v: 'All campuses', t: '한국 부모님 5/5에 오심', b: '뉴욕 첫 방문이세요. 4박 일정. 식당/박물관/쇼핑 추천 부탁.' },
  { c: 'All', v: 'All campuses', t: '치과 한국분 추천 부탁드려요', b: '한인 치과 32가 안에 좋은 곳? 보험 NYU SHIP. wisdom tooth 검진.' },
  { c: 'All', v: 'All campuses', t: '한국 카드 → 뉴욕 송금 어떻게?', b: 'Toss랑 wise 둘 다 써봤는데 fees 차이 좀 있음. 다른 service 쓰는 분?' },
  { c: 'All', v: 'All campuses', t: '학생 비자 OPT 처음이에요', b: '졸업 5월인데 OPT 신청 막막. 학교 international office 도움 받으셨나요?' },
  { c: 'All', v: 'All campuses', t: 'ASMR 추천 좀 ㅠ', b: '시험 기간 잠 안와요. 한국 ASMR 채널 추천. 나레이션 있는 거 위주.' },
];

console.log(`seed: ${POSTS.length} posts across ${userIds.length} users`);

const now = Date.now();
const TWO_WEEKS = 14 * 24 * 60 * 60 * 1000;

const rows = POSTS.slice(0, 100).map((p, i) => {
  const author = userIds[i % userIds.length];
  // Spread created_at over the past two weeks (newer at the end)
  const offset = Math.floor((TWO_WEEKS * (POSTS.length - i)) / POSTS.length) + Math.floor(Math.random() * 60 * 60 * 1000);
  const createdAt = new Date(now - offset).toISOString();
  return {
    author_id: author,
    title: p.t,
    body: p.b,
    category: p.c,
    visibility: p.v,
    created_at: createdAt,
    updated_at: createdAt,
  };
});

const { error } = await admin.from('posts').insert(rows);
if (error) {
  console.error('insert failed:', error.message);
  process.exit(1);
}

console.log(`inserted ${rows.length} posts.`);

// Optional: scatter some likes
const { data: postRows } = await admin.from('posts').select('id').order('created_at', { ascending: false }).limit(200);
const likeRows = [];
for (const p of postRows ?? []) {
  const likers = userIds.filter(() => Math.random() < 0.35);
  for (const u of likers) likeRows.push({ post_id: p.id, user_id: u });
}
if (likeRows.length > 0) {
  await admin.from('likes').upsert(likeRows, { onConflict: 'post_id,user_id', ignoreDuplicates: true });
  console.log(`seeded ~${likeRows.length} likes.`);
}

console.log('done.');
