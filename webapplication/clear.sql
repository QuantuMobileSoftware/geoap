DROP SCHEMA public CASCADE;

CREATE SCHEMA public AUTHORIZATION sip;

GRANT ALL ON SCHEMA public TO sip;
COMMENT ON SCHEMA public IS 'standard public schema';
