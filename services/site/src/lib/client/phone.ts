import intlTelInput from "intl-tel-input/intlTelInputWithUtils";
import "intl-tel-input/styles";
import "@styles/phone.css";

type Iti = ReturnType<typeof intlTelInput>;

const instances = new WeakMap<HTMLInputElement, Iti>();

export function enhancePhoneInput(input: HTMLInputElement): Iti {
  const existing = instances.get(input);
  if (existing) return existing;

  const iti = intlTelInput(input, {
    initialCountry: "fr",
    initialCountryLookup: async (): Promise<any> => {
      try {
        const res = await fetch("/api/geo", { headers: { accept: "application/json" } });
        if (res.ok) {
          const data = (await res.json()) as { country?: string };
          const c = (data.country ?? "").trim().toLowerCase();
          if (c) return c;
        }
      } catch {}
      return "fr";
    },
    strictMode: true,
    countrySearch: true,
  });

  instances.set(input, iti);
  return iti;
}

export function getPhoneE164(input: HTMLInputElement): string {
  const iti = instances.get(input);
  const num = iti?.getNumber();
  return num && num.length > 0 ? num : input.value.trim();
}
