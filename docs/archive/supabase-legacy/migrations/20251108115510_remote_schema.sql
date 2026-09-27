


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."update_pasar_malams_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_pasar_malams_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."pasar_malams" (
    "id" character varying(128) NOT NULL,
    "name" character varying(256) NOT NULL,
    "address" character varying(512) NOT NULL,
    "district" character varying(128) NOT NULL,
    "state" character varying(64) NOT NULL,
    "status" character varying(32) DEFAULT 'Active'::character varying NOT NULL,
    "description" "text",
    "area_m2" numeric(12,2),
    "total_shop" integer,
    "parking_available" boolean DEFAULT false NOT NULL,
    "parking_accessible" boolean DEFAULT false NOT NULL,
    "parking_notes" "text",
    "amen_toilet" boolean DEFAULT false NOT NULL,
    "amen_prayer_room" boolean DEFAULT false NOT NULL,
    "location" "jsonb",
    "schedule" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "shop_list" "text",
    CONSTRAINT "chk_schedule_is_array" CHECK (("jsonb_typeof"("schedule") = 'array'::"text")),
    CONSTRAINT "chk_status" CHECK ((("status")::"text" = ANY ((ARRAY['Active'::character varying, 'Inactive'::character varying, 'Suspended'::character varying, 'Closed'::character varying])::"text"[])))
);


ALTER TABLE "public"."pasar_malams" OWNER TO "postgres";


COMMENT ON COLUMN "public"."pasar_malams"."shop_list" IS 'list of shops';



ALTER TABLE ONLY "public"."pasar_malams"
    ADD CONSTRAINT "pasar_malams_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_pasar_malams_amenities" ON "public"."pasar_malams" USING "btree" ("amen_toilet", "amen_prayer_room");



CREATE INDEX "idx_pasar_malams_parking" ON "public"."pasar_malams" USING "btree" ("parking_available", "parking_accessible");



CREATE INDEX "idx_pasar_malams_schedule_gin" ON "public"."pasar_malams" USING "gin" ("schedule");



CREATE INDEX "idx_pasar_malams_state" ON "public"."pasar_malams" USING "btree" ("state");



CREATE INDEX "idx_pasar_malams_state_active" ON "public"."pasar_malams" USING "btree" ("state") WHERE (("status")::"text" = 'Active'::"text");



CREATE INDEX "idx_pasar_malams_state_district" ON "public"."pasar_malams" USING "btree" ("state", "district");



CREATE INDEX "idx_pasar_malams_status" ON "public"."pasar_malams" USING "btree" ("status") WHERE (("status")::"text" = 'Active'::"text");



CREATE OR REPLACE TRIGGER "update_pasar_malams_updated_at" BEFORE UPDATE ON "public"."pasar_malams" FOR EACH ROW EXECUTE FUNCTION "public"."update_pasar_malams_updated_at"();



CREATE POLICY "Authenticated users can delete" ON "public"."pasar_malams" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can insert" ON "public"."pasar_malams" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Authenticated users can update" ON "public"."pasar_malams" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Public read access" ON "public"."pasar_malams" FOR SELECT USING (true);



ALTER TABLE "public"."pasar_malams" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."update_pasar_malams_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_pasar_malams_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_pasar_malams_updated_at"() TO "service_role";


















GRANT ALL ON TABLE "public"."pasar_malams" TO "anon";
GRANT ALL ON TABLE "public"."pasar_malams" TO "authenticated";
GRANT ALL ON TABLE "public"."pasar_malams" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































