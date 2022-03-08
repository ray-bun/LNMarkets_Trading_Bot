-- -------------------------------------------------------------
-- REPLACE "TESTNET with your BOTNAME" to match USERNAME in the config .ENV 
-- REPLACE "1h" with your trading timeframe to match TRADING_VIEW_API_TIMEFRAME in the config .ENV 
-- -------------------------------------------------------------


DROP TABLE IF EXISTS "public"."TESTNET_1h_cashin_positions";
-- This script only contains the table creation statements and does not fully represent the table in the database. It's still missing: indices, triggers. Do not use it as a backup.

-- Table Definition
CREATE TABLE "public"."TESTNET_1h_cashin_positions" (
    "id" int8 NOT NULL,
    "created_at" timestamptz DEFAULT now(),
    "pid" text,
    "side" text,
    "price" float8,
    "pl" int8,
    "win" bool DEFAULT false,
    "trade_completed" bool DEFAULT false,
    "type" text,
    "position_status" text,
    "exit_price" float8,
    "stoploss_price" float8,
    "take_profit" float8,
    "pid_parent" text,
    "previous_pl" float8,
    PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "public"."TESTNET_1h_positions";
-- This script only contains the table creation statements and does not fully represent the table in the database. It's still missing: indices, triggers. Do not use it as a backup.

-- Table Definition
CREATE TABLE "public"."TESTNET_1h_positions" (
    "id" int8 NOT NULL,
    "created_at" timestamptz DEFAULT now(),
    "pid" text,
    "side" text,
    "price" float8,
    "pl" int8,
    "win" bool DEFAULT false,
    "trade_completed" bool DEFAULT false,
    "type" text,
    "position_status" text,
    "exit_price" float8,
    "stoploss_price" float8,
    "take_profit_target_one" float8,
    "take_profit" float8,
    "positionLabel" text,
    "stoploss_target_one" float8,
    "previous_pl" float8,
    PRIMARY KEY ("id")
);

