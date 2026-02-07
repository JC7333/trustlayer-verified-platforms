onBlur={() => {
  setNewProvider((prev) => {
    const trimmed = prev.contact_phone.trim();
    if (!trimmed) {
      return prev;
    }
    const normalized = normalizePhoneToE164(trimmed);
    return {
      ...prev,
      contact_phone: normalized,
    };
  });
}}