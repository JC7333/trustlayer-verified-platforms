-- Delete old VTC rules_items
DELETE FROM rules_items WHERE package_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

-- Rename the rule pack
UPDATE rules_packages 
SET name = 'Obligation de vigilance (Art. D.8222-5 C. trav.)', 
    vertical = 'general',
    updated_at = now()
WHERE id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

-- Insert new D.8222-5 rules_items
INSERT INTO rules_items (package_id, name, description, document_type, is_required, expiration_days, score_weight) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Attestation de vigilance URSSAF', 'Attestation de fourniture des déclarations sociales et de paiement des cotisations (art. L.243-15 CSS). Moins de 6 mois. Authenticité vérifiable sur urssaf.fr.', 'attestation_urssaf', true, 180, 20),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Extrait Kbis ou inscription RNE', 'Justificatif d''immatriculation au Registre du Commerce (Kbis) ou au Répertoire National des Entreprises (RNE). Moins de 3 mois.', 'kbis_rne', true, 90, 20),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Attestation salariés étrangers', 'Liste nominative des salariés étrangers soumis à autorisation de travail (art. D.8254-2) OU attestation sur l''honneur de non-emploi de travailleurs étrangers hors EEE.', 'lnte_attestation', true, 180, 20),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Attestation d''assurance RC Professionnelle', 'Assurance responsabilité civile professionnelle en cours de validité.', 'rc_pro', false, 365, 10),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Attestation de régularité fiscale', 'Attestation de l''administration fiscale (formulaire 3666-SD). Obligatoire en marchés publics, recommandé en privé.', 'regularite_fiscale', false, 365, 10);