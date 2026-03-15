import type { MatchRecord, MatchupRecord, TeamRecord } from "@/lib/types";

type FortuneTone = "dominant" | "slugfest" | "pitching" | "danger" | "balanced";

type KeyPlayerSummary = {
  name: string;
  line: string;
};

type FortunePoolParts = {
  openings: string[];
  omens: string[];
  closings: string[];
};

function buildVariants(stems: string[], tails: string[]) {
  return stems.flatMap((stem) => tails.map((tail) => `${stem}${tail}`));
}

const OPENING_TAILS = [
  " 오늘은 그 온도가 조금 더 길게 남을 듯합니다.",
  " 경기의 결도 그 방향을 조용히 따라갈 가능성이 있습니다.",
  " 그 기류가 하루 전체를 감쌀 것 같은 느낌이 있습니다.",
  " 그 결이 생각보다 또렷하게 드러날 수 있습니다.",
  " 그 여운이 초반부터 서서히 번질 듯합니다.",
  " 그 흐름이 생각보다 쉽게 꺾이지 않을 것처럼 보입니다.",
  " 초반 공기의 농도도 그쪽으로 조금 더 짙어질 수 있습니다.",
  " 오늘은 그 온기가 예상보다 오래 머무를 가능성이 있습니다.",
  " 한 번 잡힌 인상이 경기 내내 잔향처럼 이어질 듯합니다.",
  " 작은 기세 하나가 제법 넓게 퍼져 나갈 것 같은 날입니다.",
  " 그 방향성이 생각보다 일찍 분명해질 수도 있습니다.",
  " 오늘은 그 미세한 차이가 더 선명하게 느껴질 수 있습니다.",
  " 초반에 스친 감각이 끝까지 남아 있을 듯한 기류입니다.",
  " 경기의 바탕색도 그 무드에 맞춰 천천히 짙어질 것 같습니다.",
  " 조용히 시작해도 결국 같은 방향으로 모여들 가능성이 있습니다."
];

const OMEN_TAILS = [
  " 보이지 않는 결이 은근히 살아 있습니다.",
  " 그래서 쉽게 설명되지 않는 예감이 남습니다.",
  " 어쩐지 한 번의 장면이 크게 번질 듯합니다.",
  " 묘하게도 그 암시가 오래 머물 것 같습니다.",
  " 오늘은 그런 신호를 무시하기 어려워 보입니다.",
  " 작게 지나갈 듯한 장면도 유난히 크게 남을 수 있습니다.",
  " 표면 아래에서 천천히 움직이는 신호가 느껴집니다.",
  " 그래서 사소한 선택 하나도 꽤 의미 있게 번질 수 있습니다.",
  " 눈에 잘 띄지 않는 기류가 은근히 방향을 만들고 있습니다.",
  " 오늘은 작은 예감 하나가 오래 마음에 걸릴 수 있습니다.",
  " 장면 사이사이에 설명하기 힘든 암시가 이어지고 있습니다.",
  " 묘하게도 오늘은 미세한 균열이 먼저 말을 걸어올 듯합니다.",
  " 겉으로는 잠잠해도 안쪽에서는 결이 살아 움직이고 있습니다.",
  " 어느 한순간의 표정이 전체 분위기를 바꿀 수도 있습니다.",
  " 직감이 먼저 반응하는 장면이 조용히 찾아올 가능성이 있습니다."
];

const CLOSING_TAILS = [
  " 결국 승부처의 표정도 그쪽으로 기울 수 있습니다.",
  " 그래서 마지막에는 준비된 쪽이 웃을 가능성이 있습니다.",
  " 흐름 하나가 생각보다 오래 유지될 여지가 있습니다.",
  " 한 번 잡은 리듬이 끝까지 이어질 수도 있습니다.",
  " 오늘은 그 차이가 꽤 또렷하게 남을 수 있습니다.",
  " 마지막 장면의 무게도 결국 그 흐름을 따라갈 가능성이 있습니다.",
  " 끝내는 힘을 가진 쪽이 천천히 표정을 바꿔 갈 듯합니다.",
  " 결국은 작은 우세가 큰 차이로 남을 수도 있습니다.",
  " 마지막까지 버틴 리듬이 승부를 데려갈 가능성이 있습니다.",
  " 오늘은 준비된 호흡이 끝에서 더 크게 빛날 수 있습니다.",
  " 흐름을 먼저 읽은 쪽이 결말도 먼저 손에 넣을 듯합니다.",
  " 후반의 표정은 결국 초반의 기류를 닮아갈 가능성이 있습니다.",
  " 마침내 남는 것은 순간의 화력보다 유지된 결일 수도 있습니다.",
  " 오늘은 한 번 만들어진 무드가 끝까지 자리를 지킬 듯합니다.",
  " 결국 마지막의 미세한 선택이 전체 결과를 가를 수 있습니다."
];

const DOMINANT_PARTS: FortunePoolParts = {
  openings: buildVariants(
    [
      "요즘은 득점이 붙는 장면과 실점이 눌리는 장면이 함께 살아나고 있습니다.",
      "공격의 온도와 수비의 리듬이 같은 쪽으로 맞물리는 인상이 이어집니다.",
      "경기 흐름을 읽어 보면 좋은 기색이 한 군데가 아니라 여러 곳에서 번집니다.",
      "점수는 차곡차곡 쌓이고 위기의 그림자는 짧게 스치고 지나갑니다.",
      "타선의 숨결과 마운드의 버팀이 같은 박자로 움직이고 있습니다.",
      "한 번 올라온 흐름이 쉽게 꺼지지 않는 쪽으로 결이 굳고 있습니다.",
      "득실의 무게를 함께 놓고 보면 지금은 비교적 맑은 구간에 들어와 있습니다.",
      "경기 표면 아래에 깔린 안정감이 계속 이어지는 날들이 많습니다.",
      "요즘은 작은 찬스도 꽤 크게 이어지는 힘이 느껴집니다.",
      "전반적인 균형이 단단하게 맞아들며 좋은 쪽으로 서서히 기웁니다."
    ],
    OPENING_TAILS
  ),
  omens: buildVariants(
    [
      "하늘이 늦게라도 응답할 것 같은 기분이 감돕니다.",
      "오른쪽 어딘가에서 자꾸 유리한 신호가 스쳐 옵니다.",
      "벽이 보이는 것 같아도 먼저 갈라질 쪽은 따로 있는 듯합니다.",
      "공기 속에 설명하기 어려운 여유가 천천히 퍼지고 있습니다.",
      "작은 찬스 하나가 유난히 크게 자랄 듯한 예감이 있습니다.",
      "잠깐의 답답함 뒤로 더 넓은 길이 열릴 것처럼 보입니다.",
      "보이지 않는 흐름 하나가 계속 같은 방향으로 손짓합니다.",
      "오늘은 공 하나, 타구 하나가 좋은 쪽으로 굴러갈 기운이 있습니다.",
      "먼 곳에서 오는 작은 암시들이 자꾸 한 그림으로 겹쳐집니다.",
      "급한 순간에도 먼저 숨을 고를 수 있을 듯한 분위기가 맴돕니다."
    ],
    OMEN_TAILS
  ),
  closings: buildVariants(
    [
      "오늘은 선취 흐름을 잡는다면 꽤 오래 쥐고 갈 수 있어 보입니다.",
      "한 번 만든 우세를 쉽게 놓치지 않는 전개가 나올 수 있습니다.",
      "중반 이후에도 집중력이 식지 않는 쪽으로 읽히는 하루입니다.",
      "주도권을 먼저 거머쥐는 순간 경기의 무게도 함께 따라올 수 있습니다.",
      "승부처가 와도 당황하기보다 더 또렷하게 앞으로 밀고 갈 수 있습니다.",
      "좋은 흐름을 스스로 늘려 가는 장면이 자주 나올 것 같습니다.",
      "리드 상황에서 한 걸음 더 달아나는 힘까지 기대할 만합니다.",
      "상대보다 한 박자 먼저 웃는 장면이 여러 번 이어질 수 있습니다.",
      "경기 전체가 자신감 있는 호흡으로 이어질 가능성이 큽니다.",
      "기세를 잡는 순간 그 여운이 끝까지 남을 수 있어 보입니다."
    ],
    CLOSING_TAILS
  )
};

const SLUGFEST_PARTS: FortunePoolParts = {
  openings: buildVariants(
    [
      "방망이의 기세는 뜨겁지만 실점의 그림자도 함께 길게 따라옵니다.",
      "득점은 분명 잘 나는데 경기의 온도 역시 만만치 않게 높습니다.",
      "요즘은 공방의 무게가 커서 점수판이 오래 잠잠하기 어려워 보입니다.",
      "공격은 살아 있는데 마운드의 표정은 아직 완전히 편안하지 않습니다.",
      "점수가 나는 힘과 점수를 내주는 결이 동시에 달아오르는 시기입니다.",
      "경기의 첫 언어가 정교함보다 화력으로 먼저 들려오는 날이 많습니다.",
      "리드를 잡아도 안심보다 추가점이 먼저 떠오르는 흐름입니다.",
      "한 번의 장타보다 그 다음 이닝이 더 크게 흔들리는 기색이 있습니다.",
      "공격의 파도는 높고 수비의 틈도 아직 완전히 닫히지 않았습니다.",
      "결국 누가 더 세게 몰아치느냐가 중요한 구간에 들어와 있습니다."
    ],
    OPENING_TAILS
  ),
  omens: buildVariants(
    [
      "하늘이 응답한다면 조용한 승리보다 화끈한 장면으로 답할 것 같습니다.",
      "오늘은 잠잠함보다 폭발의 신호가 먼저 스며드는 날처럼 보입니다.",
      "오른쪽에서 들어오는 기운이 이상하게 점수의 냄새를 품고 있습니다.",
      "한 번 붙은 불씨가 쉽게 꺼지지 않을 듯한 공기가 맴돕니다.",
      "오늘의 장면들은 작은 균열이 아니라 큰 흔들림으로 번질 수 있습니다.",
      "답답한 순간이 와도 그 뒤에 크게 터질 여지가 숨어 있습니다.",
      "정적보다는 소란 쪽으로 기운이 천천히 기우는 듯합니다.",
      "오늘은 숫자보다 분위기가 먼저 폭발할 가능성이 있습니다.",
      "보이지 않는 압력이 쌓이다가 한 이닝에 쏟아질 것 같은 느낌입니다.",
      "어딘가에서 먼저 불이 붙으면 그 열기가 오래 남을 듯합니다."
    ],
    OMEN_TAILS
  ),
  closings: buildVariants(
    [
      "오늘은 점수를 주고받는 흐름 속에서 한 번 더 치고 나가는 힘이 중요합니다.",
      "추가점이 추가점을 부르는 장면을 얼마나 길게 만드는지가 관건입니다.",
      "결국 공격의 응집력이 실제 결과를 밀어 움직일 가능성이 큽니다.",
      "중후반에도 끝까지 긴장을 놓기 어려운 화력전이 될 수 있습니다.",
      "리드를 잡더라도 다시 달아나는 장면이 꼭 필요해 보입니다.",
      "한 차례 크게 몰아치는 이닝이 경기 방향을 바꿀 것 같습니다.",
      "방망이의 온도를 끝까지 지키는 쪽이 마지막에 웃을 수 있습니다.",
      "점수의 크기보다 점수가 나는 타이밍이 더 크게 작용할 수 있습니다.",
      "흔들리더라도 뒤집을 힘은 충분히 남아 있는 날처럼 읽힙니다.",
      "경기의 중심이 결국 공격 쪽으로 쏠릴 가능성이 높아 보입니다."
    ],
    CLOSING_TAILS
  )
};

const PITCHING_PARTS: FortunePoolParts = {
  openings: buildVariants(
    [
      "지금의 흐름은 화끈함보다 단단함 쪽에 더 가까이 서 있습니다.",
      "점수는 많지 않아도 쉽게 무너지지 않는 결이 계속 이어집니다.",
      "마운드의 버팀이 경기의 형태를 오래 붙잡아 두고 있습니다.",
      "공격보다 실점 억제의 언어가 더 또렷하게 들리는 시기입니다.",
      "적은 점수 안에서도 계산이 서는 날들이 이어지는 편입니다.",
      "상대를 답답하게 만드는 호흡이 천천히 쌓이고 있습니다.",
      "요즘은 많은 득점보다 적은 실점이 더 분명한 장점처럼 보입니다.",
      "경기 전체를 길게 끌고 갈 수 있는 버팀목이 생겨난 인상입니다.",
      "무게중심이 타격보다 투수와 수비 쪽에 실린 날들이 많습니다.",
      "쉽게 흔들리지 않는 리듬이 조용히 자리를 잡아가고 있습니다."
    ],
    OPENING_TAILS
  ),
  omens: buildVariants(
    [
      "하늘이 응답한다면 요란한 장면보다 조용한 버팀으로 말을 걸 것 같습니다.",
      "보이지 않는 정적이 길게 남아 접전의 냄새를 짙게 만듭니다.",
      "벽이 있다면 무너지기보다 상대를 먼저 답답하게 만들 듯합니다.",
      "오늘은 한 점의 가치가 평소보다 더 묵직하게 남을 것 같습니다.",
      "침묵 속에서 작은 장면 하나가 크게 기억될 기운이 감돕니다.",
      "불꽃보다 잔광이 오래 남는 종류의 하루처럼 보입니다.",
      "급한 소리보다 낮은 파문이 더 길게 번질 것 같은 공기입니다.",
      "후반 한순간을 위해 모든 흐름이 천천히 모여드는 듯합니다.",
      "보이지 않는 압박이 쌓이며 상대가 먼저 숨이 가빠질 수도 있습니다.",
      "오늘은 화려함보다 끈기가 오래 살아남을 것 같은 신호가 있습니다."
    ],
    OMEN_TAILS
  ),
  closings: buildVariants(
    [
      "한 점 차의 결 속에서도 끝까지 승부를 붙잡고 갈 수 있어 보입니다.",
      "선취점 하나와 수비 하나가 경기의 결말을 좌우할 수 있습니다.",
      "크게 벌어지기보다 팽팽한 흐름이 오래 이어질 가능성이 높습니다.",
      "조급함보다 인내심을 가진 쪽으로 결과가 기울 수 있습니다.",
      "후반 승부에서 더 단단한 집중력이 빛날 수 있는 날입니다.",
      "적은 점수 안에서 더 정확한 선택을 한 쪽이 앞설 것 같습니다.",
      "투수진과 수비의 밀도가 결과를 오래 붙잡고 있을 수 있습니다.",
      "한 번의 찬스를 얼마나 침착하게 다루느냐가 중요합니다.",
      "흔들리지 않는 리듬 자체가 가장 큰 무기가 될 수 있습니다.",
      "버티는 힘이 곧 결과로 이어질 여지가 충분히 보입니다."
    ],
    CLOSING_TAILS
  )
};

const DANGER_PARTS: FortunePoolParts = {
  openings: buildVariants(
    [
      "득점의 숨은 짧아지고 실점의 그림자는 짙어지는 구간에 들어와 있습니다.",
      "흐름이 가볍지 않아 초반부터 긴장감이 높게 걸릴 수 있습니다.",
      "공격이 쉽게 풀리지 않고 마운드의 부담도 만만해 보이지 않습니다.",
      "작은 실수 하나가 경기 전체를 무겁게 만드는 날들이 이어졌습니다.",
      "반등이 필요하다는 신호가 분명하게 들리는 시기입니다.",
      "선제 흐름을 내주면 다시 되찾는 데 시간이 걸리는 편입니다.",
      "답답한 결이 길게 남아 경기 운영이 더 까다로워질 수 있습니다.",
      "지금은 이기기보다 먼저 무너지지 않는 태도가 더 중요해 보입니다.",
      "득실의 기울기가 조심스러운 쪽으로 계속 쏠리고 있습니다.",
      "경기 전체가 버거워질 수 있어 세밀함이 더욱 절실한 구간입니다."
    ],
    OPENING_TAILS
  ),
  omens: buildVariants(
    [
      "벽이 보이는 것 같아도 어디엔가 먼저 갈라질 틈은 남아 있을 수 있습니다.",
      "하늘이 곧바로 응답하지 않더라도 늦은 신호 하나가 반전의 시작이 될 수 있습니다.",
      "공기가 무겁지만 그 안에서 작은 출루 하나가 오래 남을 듯합니다.",
      "막막함이 먼저 와도 결은 갑자기 바뀔 수 있다는 암시가 있습니다.",
      "흐름은 불친절해 보여도 아주 닫힌 날은 아닌 듯합니다.",
      "약한 신호일수록 더 오래 보고 들어야 하는 하루처럼 느껴집니다.",
      "오늘은 단단한 한 장면이 생각보다 큰 문을 열 수도 있습니다.",
      "좋지 않은 공기 속에서도 얇은 틈이 자꾸 눈에 밟힙니다.",
      "작은 성공 하나가 전체의 호흡을 바꿔 놓을 가능성이 있습니다.",
      "답답함 뒤에 숨어 있는 미세한 균열이 먼저 드러날지도 모릅니다."
    ],
    OMEN_TAILS
  ),
  closings: buildVariants(
    [
      "초반 실점 억제와 작은 찬스 하나를 살리는 집중력이 무엇보다 중요합니다.",
      "화끈함보다 버티는 힘이 먼저 필요한 날로 보입니다.",
      "한 이닝, 한 수비, 한 출루의 가치가 평소보다 훨씬 크게 남을 수 있습니다.",
      "실수를 줄이는 쪽이 반등의 실마리를 먼저 잡을 수 있습니다.",
      "기본기를 지키는 팀이 생각보다 오래 버틸 가능성이 큽니다.",
      "선취점을 내주지 않는 것만으로도 경기의 결이 달라질 수 있습니다.",
      "끈질김 하나가 예상보다 큰 장면으로 번질 수도 있습니다.",
      "예쁜 승리보다 거친 생존 쪽에 더 가까운 하루가 될 수 있습니다.",
      "흔들리더라도 무너지지 않는 태도가 가장 중요해 보입니다.",
      "반등의 첫 문장을 쓰는 데 집중해야 하는 날처럼 읽힙니다."
    ],
    CLOSING_TAILS
  )
};

const BALANCED_PARTS: FortunePoolParts = {
  openings: buildVariants(
    [
      "득점과 실점이 크게 한쪽으로 기울지 않는 균형의 구간을 지나고 있습니다.",
      "아주 좋지도 아주 나쁘지도 않은 결이라 디테일이 더 크게 보입니다.",
      "강한 압도보다 비슷한 무게의 공방으로 이어지는 날들이 많습니다.",
      "팽팽한 흐름 속에서 작은 차이가 결과를 만질 가능성이 큽니다.",
      "한쪽 장점보다 전체적인 짜임새가 더 중요해 보이는 시기입니다.",
      "안정과 기복이 함께 섞인 중간 지대를 천천히 통과하고 있습니다.",
      "무게추가 아직 어느 한쪽으로는 크게 기울지 않았습니다.",
      "화끈한 폭발보다 차분한 누적이 더 자주 보이는 편입니다.",
      "큰 장면 하나보다 여러 작은 장면이 결과를 만들어 갑니다.",
      "전체적인 밸런스가 승부의 핵심으로 떠오르는 흐름입니다."
    ],
    OPENING_TAILS
  ),
  omens: buildVariants(
    [
      "하늘이 아직 어느 쪽을 먼저 볼지 정하지 않은 듯한 공기가 있습니다.",
      "희미한 암시가 분명한 계시보다 더 많이 떠다니는 날처럼 보입니다.",
      "오른쪽과 왼쪽에서 오는 기운이 비슷해 작은 선택이 더 크게 남을 수 있습니다.",
      "벽이 보이는 것 같다가도 길이 열리는 날은 늘 이런 균형 속에서 시작됩니다.",
      "애매한 공기일수록 집중력 하나가 큰 차이를 만들곤 합니다.",
      "팽팽하게 당겨진 흐름 속에서 작은 신호 하나가 결을 깨뜨릴 수 있습니다.",
      "정적과 움직임이 반반씩 섞여 있어 더 세밀한 감각이 필요해 보입니다.",
      "길이 선명하지 않아서 오히려 준비된 쪽이 먼저 문을 열 수 있습니다.",
      "오늘은 거친 예감보다 얇은 암시가 더 설득력 있게 남습니다.",
      "사소한 장면 하나가 예상보다 길게 그림자를 드리울 수 있습니다."
    ],
    OMEN_TAILS
  ),
  closings: buildVariants(
    [
      "승부처 한두 장면을 더 정확하게 다루는 쪽이 앞설 수 있습니다.",
      "큰 한 방보다 작은 차이를 누적하는 팀이 유리해 보입니다.",
      "전체적인 완성도와 집중력이 결과를 천천히 움직일 가능성이 큽니다.",
      "중반 이후의 선택이 생각보다 크게 작용할 수 있습니다.",
      "무리한 승부보다 계획한 야구를 지키는 쪽이 오래 버틸 수 있습니다.",
      "한 번의 출루와 한 번의 수비가 체감보다 훨씬 크게 남을 수 있습니다.",
      "팽팽한 흐름 속에서 차분함을 유지하는 것이 중요합니다.",
      "끝까지 비슷한 무게로 가다가 마지막에 조금 기울 가능성이 있습니다.",
      "전체 밸런스를 오래 지키는 팀이 웃을 여지가 있습니다.",
      "준비된 디테일이 최종적인 차이로 남을 수도 있습니다."
    ],
    CLOSING_TAILS
  )
};

const FORTUNE_POOLS: Record<FortuneTone, FortunePoolParts> = {
  dominant: DOMINANT_PARTS,
  slugfest: SLUGFEST_PARTS,
  pitching: PITCHING_PARTS,
  danger: DANGER_PARTS,
  balanced: BALANCED_PARTS
};

function parseScore(score: string) {
  const [teamScoreRaw, opponentScoreRaw] = score.split("-");
  const teamScore = Number(teamScoreRaw);
  const opponentScore = Number(opponentScoreRaw);

  return {
    teamScore: Number.isFinite(teamScore) ? teamScore : 0,
    opponentScore: Number.isFinite(opponentScore) ? opponentScore : 0
  };
}

function summarizeRuns(games: MatchRecord[]) {
  return games.reduce(
    (summary, game) => {
      const { teamScore, opponentScore } = parseScore(game.score);
      summary.scored += teamScore;
      summary.allowed += opponentScore;
      return summary;
    },
    { scored: 0, allowed: 0 }
  );
}

function getRecentStreak(games: MatchRecord[]) {
  const latest = games[0];

  if (!latest || (latest.result !== "W" && latest.result !== "L")) {
    return null;
  }

  let count = 0;

  for (const game of games) {
    if (game.result !== latest.result) {
      break;
    }

    count += 1;
  }

  return count >= 2 ? { type: latest.result, count } : null;
}

function getStreakLine(record: TeamRecord) {
  const streak = getRecentStreak(record.last10);

  if (!streak) {
    return null;
  }

  if (streak.type === "W") {
    return `최근 ${streak.count}연승의 결이 이어지고 있습니다.`;
  }

  return `최근 ${streak.count}연패의 그림자가 드리워져 있어 초반 흐름이 더욱 중요합니다.`;
}

function getFortuneTone(record: TeamRecord): FortuneTone {
  const sampleGames = record.last10.slice(0, 5);
  const sourceGames = sampleGames.length > 0 ? sampleGames : record.last10;
  const { scored, allowed } = summarizeRuns(sourceGames);
  const averageScored = scored / sourceGames.length;
  const averageAllowed = allowed / sourceGames.length;

  const scoringHigh = averageScored >= 5.5;
  const scoringLow = averageScored <= 3.5;
  const allowingLow = averageAllowed <= 3.5;
  const allowingHigh = averageAllowed >= 5;

  if (scoringHigh && allowingLow) {
    return "dominant";
  }

  if (scoringHigh && allowingHigh) {
    return "slugfest";
  }

  if (scoringLow && allowingLow) {
    return "pitching";
  }

  if (scoringLow && allowingHigh) {
    return "danger";
  }

  return "balanced";
}

function hashString(input: string) {
  let hash = 0;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 33 + input.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function pickFromPool(pool: string[], seed: string, salt: string) {
  return pool[hashString(`${seed}:${salt}`) % pool.length];
}

function getRecentHitters(record: TeamRecord) {
  return record.last10.slice(0, 5).flatMap((game) => (game.standoutHitter ? [game.standoutHitter] : []));
}

function getKeyPlayerSummary(record: TeamRecord): KeyPlayerSummary {
  const hitters = getRecentHitters(record);
  const counts = new Map<string, { count: number; latestStat: string | null }>();

  for (const hitter of hitters) {
    const current = counts.get(hitter.name);
    counts.set(hitter.name, {
      count: (current?.count ?? 0) + 1,
      latestStat: current?.latestStat ?? hitter.stat
    });
  }

  let bestName: string | null = null;
  let bestCount = 0;
  let bestStat: string | null = null;

  for (const [name, info] of counts.entries()) {
    if (info.count > bestCount) {
      bestName = name;
      bestCount = info.count;
      bestStat = info.latestStat;
    }
  }

  if (!bestName) {
    return {
      name: `${record.team} 타선`,
      line: "지금은 특정 한 명보다 여러 타자가 번갈아 흐름을 흔들며 미묘한 균형을 만들고 있습니다."
    };
  }

  if (bestCount >= 3) {
    return {
      name: bestName,
      line: `${bestStat ?? "타석의 감각"}이 쉽게 식지 않고 있어 오늘도 중요한 장면과 자연스럽게 연결될 수 있습니다.`
    };
  }

  if (bestCount === 2) {
    return {
      name: bestName,
      line: "요즘 타석에서 은근히 중심을 잡아 주는 흐름이 이어지고 있어 오늘도 먼저 신호를 받을 가능성이 있습니다."
    };
  }

  return {
    name: bestName,
    line: "조용히 흐름을 건드리는 장면이 자주 보여 오늘도 은근한 변수로 남을 수 있습니다."
  };
}

function getCurrentKstFortuneKey() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}

function pickFortuneBody(record: TeamRecord, tone: FortuneTone, dayKey = getCurrentKstFortuneKey()) {
  const pools = FORTUNE_POOLS[tone];
  const seed = `${record.slug}:${record.updatedAt}:${record.last10
    .map((game) => game.gameId)
    .join(",")}:${tone}:${dayKey}`;

  return [
    pickFromPool(pools.openings, seed, "opening"),
    pickFromPool(pools.omens, seed, "omen"),
    pickFromPool(pools.closings, seed, "closing")
  ].join("\n");
}

export function buildFortune(
  record: TeamRecord,
  _matchup: MatchupRecord | null = null,
  dayKey = getCurrentKstFortuneKey()
) {
  const tone = getFortuneTone(record);
  const streakLine = getStreakLine(record);
  const body = pickFortuneBody(record, tone, dayKey);
  const keyPlayer = getKeyPlayerSummary(record);
  const leadLines = [...(streakLine ? [streakLine] : []), body].join("\n");
  const keyPlayerParagraph = [`오늘의 키플레이어는 ${keyPlayer.name}입니다.`, keyPlayer.line].join("\n");

  return [leadLines, keyPlayerParagraph].join("\n\n");
}
