-- 0014 : provenance de la première visite et règles CNIL (Juridique, 5/11).
-- Les comptes créés depuis l'Europe (UE, EEE, Royaume-Uni, Suisse ; pays inconnu compris) ne gardent plus leur provenance :
-- elle devient un total anonyme par provenance et par jour (daily_counts « src_eu:<provenance> »), et le compte garde « eu ».
-- À coller en entier, une seule fois (après la migration 0011).
INSERT INTO daily_counts (day, name, n)
  SELECT date(created_at / 1000, 'unixepoch'), 'src_eu:' || signup_source, COUNT(*) FROM users
  WHERE signup_source IS NOT NULL AND signup_source <> 'eu'
    AND (country IS NULL OR country IN ('AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV','LT','LU','MT','NL',
      'PL','PT','RO','SK','SI','ES','SE','IS','LI','NO','GB','CH'))
  GROUP BY 1, 2
  ON CONFLICT(day, name) DO UPDATE SET n = n + excluded.n;
UPDATE users SET signup_source = 'eu'
  WHERE signup_source IS NOT NULL AND signup_source <> 'eu'
    AND (country IS NULL OR country IN ('AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV','LT','LU','MT','NL',
      'PL','PT','RO','SK','SI','ES','SE','IS','LI','NO','GB','CH'));
