type UFCEvent = {
  name: string;
  url: URL;
  date: string;
  location: string;
  fightCard: string[];
  mainCard: string[];
  prelims: string[];
  earlyPrelims: string[];
  prelimsTime: string | undefined;
  earlyPrelimsTime: string | undefined;
};
