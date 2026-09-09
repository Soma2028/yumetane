"""job tag（日本版O-NET）ダウンロードデータの読み込みユーティリティ。

description/numeric いずれのCSVも、先頭に注記行があり、実データは
「日本語ラベル行」「IPDコード行」の2段ヘッダーの後から始まる、CP932エンコーディング。
"""

import pandas as pd

DESC_PATH = "../data/raw/IPD_DL_description_7_01.csv"
NUM_PATH = "../data/raw/IPD_DL_numeric_7_00.csv"


def load_ipd(path, label_row, code_row, data_start_row):
    """job tag ダウンロードデータを読み込む。

    先頭2列（ファイル内通し番号・空列）は捨て、IPDコードを列名として使う。
    戻り値: (データ本体のDataFrame, {IPDコード: 日本語ラベル} の辞書)
    """
    df = pd.read_csv(path, encoding="cp932", header=None, skiprows=data_start_row)
    labels = pd.read_csv(path, encoding="cp932", header=None, skiprows=label_row, nrows=1).iloc[0]
    codes = pd.read_csv(path, encoding="cp932", header=None, skiprows=code_row, nrows=1).iloc[0]

    df = df.iloc[:, 2:]
    labels = labels.iloc[2:]
    codes = codes.iloc[2:]
    df.columns = codes.values

    # 末尾の空行を除去（収録番号が空のもの）
    df = df.dropna(subset=[codes.iloc[0]]).reset_index(drop=True)

    label_map = dict(zip(codes, labels))
    return df, label_map


def load_description():
    return load_ipd(DESC_PATH, label_row=12, code_row=13, data_start_row=14)


def load_numeric():
    return load_ipd(NUM_PATH, label_row=16, code_row=17, data_start_row=18)
