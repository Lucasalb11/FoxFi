/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/foxfi.json`.
 */
export type Foxfi = {
  "address": "FBC9go2hb8pMYGgeAYZa6hWYPSxFbGVuF3fv1J7gtXtb",
  "metadata": {
    "name": "foxfi",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "FoxFi Protocol - Intent-Based DEX on Solana"
  },
  "instructions": [
    {
      "name": "cancelIntent",
      "docs": [
        "Refunds the user's input: before any bid, or after the winner misses the deadline"
      ],
      "discriminator": [
        67,
        73,
        238,
        244,
        208,
        89,
        225,
        59
      ],
      "accounts": [
        {
          "name": "intent",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  105,
                  110,
                  116,
                  101,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "account",
                "path": "intent.seed",
                "account": "intent"
              }
            ]
          }
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true,
          "relations": [
            "intent"
          ]
        },
        {
          "name": "inputMint",
          "relations": [
            "intent"
          ]
        },
        {
          "name": "userInputAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "inputMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "inputVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "inputMint"
              }
            ]
          }
        },
        {
          "name": "winningSolver",
          "docs": [
            "Required only when refunding after the winner defaulted."
          ],
          "writable": true,
          "optional": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": []
    },
    {
      "name": "closeSolver",
      "docs": [
        "Solver leaves the network and gets its stake back"
      ],
      "discriminator": [
        64,
        175,
        7,
        85,
        37,
        105,
        59,
        137
      ],
      "accounts": [
        {
          "name": "solver",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  111,
                  108,
                  118,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "solver"
          ]
        }
      ],
      "args": []
    },
    {
      "name": "createIntent",
      "docs": [
        "Creates a new swap intent",
        "User submits what they want to swap and constraints"
      ],
      "discriminator": [
        216,
        214,
        79,
        121,
        23,
        194,
        96,
        104
      ],
      "accounts": [
        {
          "name": "intent",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  105,
                  110,
                  116,
                  101,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "account",
                "path": "config.total_intents",
                "account": "protocolConfig"
              }
            ]
          }
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "inputMint"
        },
        {
          "name": "outputMint"
        },
        {
          "name": "userInputAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "inputMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "inputVault",
          "docs": [
            "Vault to hold input tokens during intent lifecycle",
            "Note: In production, use a single vault per mint initialized separately"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "inputMint"
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "inputAmount",
          "type": "u64"
        },
        {
          "name": "minOutputAmount",
          "type": "u64"
        },
        {
          "name": "expirationSeconds",
          "type": "i64"
        }
      ]
    },
    {
      "name": "executeSettlement",
      "docs": [
        "Winning solver pays its quote and receives the user's input, atomically"
      ],
      "discriminator": [
        237,
        120,
        82,
        62,
        224,
        193,
        147,
        137
      ],
      "accounts": [
        {
          "name": "intent",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  105,
                  110,
                  116,
                  101,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "intent.user",
                "account": "intent"
              },
              {
                "kind": "account",
                "path": "intent.seed",
                "account": "intent"
              }
            ]
          }
        },
        {
          "name": "solver",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  111,
                  108,
                  118,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "solverAuthority"
              }
            ]
          }
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "solverAuthority",
          "writable": true,
          "signer": true
        },
        {
          "name": "user",
          "relations": [
            "intent"
          ]
        },
        {
          "name": "inputMint",
          "relations": [
            "intent"
          ]
        },
        {
          "name": "outputMint",
          "relations": [
            "intent"
          ]
        },
        {
          "name": "inputVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "inputMint"
              }
            ]
          }
        },
        {
          "name": "userOutputAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "outputMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "solverOutputAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "solverAuthority"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "outputMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "solverInputAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "solverAuthority"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "inputMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "protocolFeeAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "config.treasury",
                "account": "protocolConfig"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "outputMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        }
      ],
      "args": []
    },
    {
      "name": "initialize",
      "docs": [
        "Initializes the protocol configuration",
        "Only called once to set up the protocol"
      ],
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "treasury"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "protocolFeeBps",
          "type": "u16"
        },
        {
          "name": "solverFeeBps",
          "type": "u16"
        },
        {
          "name": "minSolverStake",
          "type": "u64"
        },
        {
          "name": "maxSlippageBps",
          "type": "u16"
        }
      ]
    },
    {
      "name": "initializeVault",
      "docs": [
        "Initialize a token vault (must be called before creating intents for that token)"
      ],
      "discriminator": [
        48,
        191,
        163,
        44,
        71,
        129,
        63,
        164
      ],
      "accounts": [
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "vault",
          "docs": [
            "Vault to hold tokens"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ]
          }
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "registerSolver",
      "docs": [
        "Registers a new solver in the network",
        "Solver must stake minimum amount to participate"
      ],
      "discriminator": [
        143,
        125,
        182,
        215,
        172,
        69,
        137,
        105
      ],
      "accounts": [
        {
          "name": "solver",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  111,
                  108,
                  118,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "stakeAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "submitSolution",
      "docs": [
        "Solver submits a solution for an intent",
        "Solution includes expected output amount and route"
      ],
      "discriminator": [
        203,
        233,
        157,
        191,
        70,
        37,
        205,
        0
      ],
      "accounts": [
        {
          "name": "intent",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  105,
                  110,
                  116,
                  101,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "intent.user",
                "account": "intent"
              },
              {
                "kind": "account",
                "path": "intent.seed",
                "account": "intent"
              }
            ]
          }
        },
        {
          "name": "solution",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  111,
                  108,
                  117,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "intent"
              },
              {
                "kind": "account",
                "path": "solver"
              }
            ]
          }
        },
        {
          "name": "solver",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  111,
                  108,
                  118,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "solverAuthority"
              }
            ]
          }
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "solverAuthority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "expectedOutput",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateConfig",
      "docs": [
        "Admin updates protocol configuration"
      ],
      "discriminator": [
        29,
        158,
        252,
        191,
        10,
        83,
        219,
        99
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "admin",
          "signer": true,
          "relations": [
            "config"
          ]
        }
      ],
      "args": [
        {
          "name": "protocolFeeBps",
          "type": {
            "option": "u16"
          }
        },
        {
          "name": "solverFeeBps",
          "type": {
            "option": "u16"
          }
        },
        {
          "name": "minSolverStake",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "maxSlippageBps",
          "type": {
            "option": "u16"
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "intent",
      "discriminator": [
        247,
        162,
        35,
        165,
        254,
        111,
        129,
        109
      ]
    },
    {
      "name": "protocolConfig",
      "discriminator": [
        207,
        91,
        250,
        28,
        152,
        179,
        215,
        209
      ]
    },
    {
      "name": "solution",
      "discriminator": [
        224,
        203,
        158,
        221,
        167,
        87,
        165,
        3
      ]
    },
    {
      "name": "solver",
      "discriminator": [
        174,
        70,
        187,
        101,
        208,
        40,
        95,
        77
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "protocolFeeTooHigh",
      "msg": "Protocol fee exceeds maximum allowed"
    },
    {
      "code": 6001,
      "name": "solverFeeTooHigh",
      "msg": "Solver fee exceeds maximum allowed"
    },
    {
      "code": 6002,
      "name": "slippageTooHigh",
      "msg": "Slippage tolerance exceeds maximum allowed"
    },
    {
      "code": 6003,
      "name": "intentExpired",
      "msg": "Intent has already expired"
    },
    {
      "code": 6004,
      "name": "invalidExpiration",
      "msg": "Intent expiration time is invalid"
    },
    {
      "code": 6005,
      "name": "intentStillActive",
      "msg": "Intent is still active and cannot be cancelled"
    },
    {
      "code": 6006,
      "name": "intentAlreadyExecuted",
      "msg": "Intent has already been executed"
    },
    {
      "code": 6007,
      "name": "intentCancelled",
      "msg": "Intent has been cancelled"
    },
    {
      "code": 6008,
      "name": "minOutputNotMet",
      "msg": "Minimum output amount not met"
    },
    {
      "code": 6009,
      "name": "invalidSolution",
      "msg": "Solution does not meet intent requirements"
    },
    {
      "code": 6010,
      "name": "solverNotRegistered",
      "msg": "Solver is not registered"
    },
    {
      "code": 6011,
      "name": "insufficientSolverStake",
      "msg": "Solver stake is insufficient"
    },
    {
      "code": 6012,
      "name": "solverNotActive",
      "msg": "Solver is not active"
    },
    {
      "code": 6013,
      "name": "solverAlreadyRegistered",
      "msg": "Solver already registered"
    },
    {
      "code": 6014,
      "name": "noRewardsToClaim",
      "msg": "No rewards available to claim"
    },
    {
      "code": 6015,
      "name": "unauthorized",
      "msg": "Unauthorized access"
    },
    {
      "code": 6016,
      "name": "arithmeticOverflow",
      "msg": "Arithmetic overflow"
    },
    {
      "code": 6017,
      "name": "invalidMint",
      "msg": "Invalid token mint"
    },
    {
      "code": 6018,
      "name": "invalidInputAmount",
      "msg": "Input amount must be greater than zero"
    },
    {
      "code": 6019,
      "name": "invalidOutputAmount",
      "msg": "Output amount must be greater than zero"
    },
    {
      "code": 6020,
      "name": "solutionAlreadySubmitted",
      "msg": "Solution already submitted for this intent"
    },
    {
      "code": 6021,
      "name": "intentNotReadyForSettlement",
      "msg": "Intent not ready for settlement"
    },
    {
      "code": 6022,
      "name": "invalidVaultAuthority",
      "msg": "Invalid vault authority"
    },
    {
      "code": 6023,
      "name": "auctionClosed",
      "msg": "The bidding window for this intent has closed"
    },
    {
      "code": 6024,
      "name": "auctionStillOpen",
      "msg": "Bidding is still open; settle after the auction ends"
    },
    {
      "code": 6025,
      "name": "refundNotAvailable",
      "msg": "Refunds are only available before any bid, or after the winner misses the deadline"
    }
  ],
  "types": [
    {
      "name": "intent",
      "docs": [
        "Represents a user's swap intent",
        "This is the core data structure of FoxFi Protocol"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "docs": [
              "User who created this intent"
            ],
            "type": "pubkey"
          },
          {
            "name": "inputMint",
            "docs": [
              "Token the user wants to swap from"
            ],
            "type": "pubkey"
          },
          {
            "name": "outputMint",
            "docs": [
              "Token the user wants to receive"
            ],
            "type": "pubkey"
          },
          {
            "name": "inputAmount",
            "docs": [
              "Amount of input token to swap"
            ],
            "type": "u64"
          },
          {
            "name": "minOutputAmount",
            "docs": [
              "Minimum acceptable amount of output token",
              "Protects against slippage"
            ],
            "type": "u64"
          },
          {
            "name": "expiration",
            "docs": [
              "Unix timestamp when this intent expires"
            ],
            "type": "i64"
          },
          {
            "name": "createdAt",
            "docs": [
              "When this intent was created"
            ],
            "type": "i64"
          },
          {
            "name": "status",
            "docs": [
              "Current status of this intent"
            ],
            "type": {
              "defined": {
                "name": "intentStatus"
              }
            }
          },
          {
            "name": "winningSolver",
            "docs": [
              "Solver who won the right to execute this intent"
            ],
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "bestSolution",
            "docs": [
              "Best solution submitted so far"
            ],
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "actualOutput",
            "docs": [
              "Actual output amount received (set after execution)"
            ],
            "type": "u64"
          },
          {
            "name": "bestOutput",
            "docs": [
              "Highest quote received so far. Settlement pays this, not the user's minimum."
            ],
            "type": "u64"
          },
          {
            "name": "auctionEnd",
            "docs": [
              "Solvers can bid until this time; settlement only after it."
            ],
            "type": "i64"
          },
          {
            "name": "feesPaid",
            "docs": [
              "Fees paid (protocol + solver)"
            ],
            "type": "u64"
          },
          {
            "name": "seed",
            "docs": [
              "Seed used for PDA derivation"
            ],
            "type": "u64"
          },
          {
            "name": "bump",
            "docs": [
              "Bump seed for PDA"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "intentStatus",
      "docs": [
        "Status of an intent through its lifecycle"
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "open"
          },
          {
            "name": "solutionSubmitted"
          },
          {
            "name": "readyForSettlement"
          },
          {
            "name": "executed"
          },
          {
            "name": "cancelled"
          },
          {
            "name": "expired"
          }
        ]
      }
    },
    {
      "name": "protocolConfig",
      "docs": [
        "Protocol configuration account",
        "Stores global protocol parameters that can be updated by admin"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "docs": [
              "Admin authority that can update config"
            ],
            "type": "pubkey"
          },
          {
            "name": "protocolFeeBps",
            "docs": [
              "Protocol fee in basis points (1 bps = 0.01%)",
              "Goes to protocol treasury"
            ],
            "type": "u16"
          },
          {
            "name": "solverFeeBps",
            "docs": [
              "Solver reward fee in basis points",
              "Paid to solver for finding best execution"
            ],
            "type": "u16"
          },
          {
            "name": "minSolverStake",
            "docs": [
              "Minimum stake required to become a solver"
            ],
            "type": "u64"
          },
          {
            "name": "maxSlippageBps",
            "docs": [
              "Maximum allowed slippage in basis points"
            ],
            "type": "u16"
          },
          {
            "name": "treasury",
            "docs": [
              "Protocol treasury for collecting fees"
            ],
            "type": "pubkey"
          },
          {
            "name": "totalProtocolFees",
            "docs": [
              "Total fees collected by protocol"
            ],
            "type": "u64"
          },
          {
            "name": "totalSolverFees",
            "docs": [
              "Total fees paid to solvers"
            ],
            "type": "u64"
          },
          {
            "name": "totalIntents",
            "docs": [
              "Total number of intents created"
            ],
            "type": "u64"
          },
          {
            "name": "totalExecuted",
            "docs": [
              "Total number of intents executed"
            ],
            "type": "u64"
          },
          {
            "name": "totalVolume",
            "docs": [
              "Total volume processed (in USD equivalent)"
            ],
            "type": "u64"
          },
          {
            "name": "bump",
            "docs": [
              "Bump seed for PDA"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "solution",
      "docs": [
        "Represents a solver's proposed solution for an intent",
        "Solvers submit solutions that compete for best execution"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "intent",
            "docs": [
              "Intent this solution is for"
            ],
            "type": "pubkey"
          },
          {
            "name": "solver",
            "docs": [
              "Solver who submitted this solution"
            ],
            "type": "pubkey"
          },
          {
            "name": "expectedOutput",
            "docs": [
              "Expected output amount this solution will provide"
            ],
            "type": "u64"
          },
          {
            "name": "route",
            "docs": [
              "Execution route/path (for future multi-hop support)",
              "For MVP, this could be empty or contain DEX identifier"
            ],
            "type": "bytes"
          },
          {
            "name": "submittedAt",
            "docs": [
              "When this solution was submitted"
            ],
            "type": "i64"
          },
          {
            "name": "isWinning",
            "docs": [
              "Whether this solution won"
            ],
            "type": "bool"
          },
          {
            "name": "bump",
            "docs": [
              "Bump seed for PDA"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "solver",
      "docs": [
        "Solver account - represents a registered solver in the network",
        "Solvers compete to find best execution for intents"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "docs": [
              "Authority that controls this solver"
            ],
            "type": "pubkey"
          },
          {
            "name": "stakeAmount",
            "docs": [
              "Amount staked by this solver",
              "Required to participate and can be slashed for misbehavior"
            ],
            "type": "u64"
          },
          {
            "name": "totalSolved",
            "docs": [
              "Total number of intents solved by this solver"
            ],
            "type": "u64"
          },
          {
            "name": "totalFailed",
            "docs": [
              "Total number of intents failed/invalid"
            ],
            "type": "u64"
          },
          {
            "name": "reputationScore",
            "docs": [
              "Reputation score (0-10000 basis points)",
              "Higher score = better solver"
            ],
            "type": "u64"
          },
          {
            "name": "totalFeesEarned",
            "docs": [
              "Total fees earned by this solver"
            ],
            "type": "u64"
          },
          {
            "name": "unclaimedRewards",
            "docs": [
              "Unclaimed rewards available for withdrawal"
            ],
            "type": "u64"
          },
          {
            "name": "isActive",
            "docs": [
              "Whether this solver is active"
            ],
            "type": "bool"
          },
          {
            "name": "registeredAt",
            "docs": [
              "When this solver was registered"
            ],
            "type": "i64"
          },
          {
            "name": "lastActive",
            "docs": [
              "Last time this solver submitted a solution"
            ],
            "type": "i64"
          },
          {
            "name": "bump",
            "docs": [
              "Bump seed for PDA"
            ],
            "type": "u8"
          }
        ]
      }
    }
  ],
  "constants": [
    {
      "name": "auctionSeconds",
      "docs": [
        "How long solvers can bid on a new intent. Settlement opens afterwards."
      ],
      "type": "i64",
      "value": "20"
    },
    {
      "name": "bpsDenominator",
      "type": "u64",
      "value": "10000"
    },
    {
      "name": "configSeed",
      "type": "bytes",
      "value": "[99, 111, 110, 102, 105, 103]"
    },
    {
      "name": "defaultMaxSlippageBps",
      "type": "u16",
      "value": "100"
    },
    {
      "name": "defaultMinSolverStake",
      "type": "u64",
      "value": "1000000000"
    },
    {
      "name": "defaultProtocolFeeBps",
      "type": "u16",
      "value": "5"
    },
    {
      "name": "defaultSolverFeeBps",
      "type": "u16",
      "value": "10"
    },
    {
      "name": "intentSeed",
      "type": "bytes",
      "value": "[105, 110, 116, 101, 110, 116]"
    },
    {
      "name": "maxIntentExpiration",
      "type": "i64",
      "value": "86400"
    },
    {
      "name": "maxProtocolFeeBps",
      "type": "u16",
      "value": "100"
    },
    {
      "name": "maxSlippageBps",
      "type": "u16",
      "value": "1000"
    },
    {
      "name": "maxSolverFeeBps",
      "type": "u16",
      "value": "200"
    },
    {
      "name": "minIntentExpiration",
      "type": "i64",
      "value": "60"
    },
    {
      "name": "solutionSeed",
      "type": "bytes",
      "value": "[115, 111, 108, 117, 116, 105, 111, 110]"
    },
    {
      "name": "solverSeed",
      "type": "bytes",
      "value": "[115, 111, 108, 118, 101, 114]"
    },
    {
      "name": "vaultSeed",
      "type": "bytes",
      "value": "[118, 97, 117, 108, 116]"
    }
  ]
};
