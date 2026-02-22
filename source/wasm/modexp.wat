(module
  (func $powmod_u64 (export "powmod_u64") (param $base i64) (param $exponent i64) (param $modulo i64) (result i64)
    (local $result i64)
    (local $b i64)
    (local $e i64)

    i64.const 1
    local.set $result

    local.get $base
    local.get $modulo
    i64.rem_u
    local.set $b

    local.get $exponent
    local.set $e

    (block $done
      (loop $loop
        local.get $e
        i64.eqz
        br_if $done

        local.get $e
        i64.const 1
        i64.and
        i64.const 1
        i64.eq
        (if
          (then
            local.get $result
            local.get $b
            i64.mul
            local.get $modulo
            i64.rem_u
            local.set $result
          )
        )

        local.get $b
        local.get $b
        i64.mul
        local.get $modulo
        i64.rem_u
        local.set $b

        local.get $e
        i64.const 1
        i64.shr_u
        local.set $e

        br $loop
      )
    )

    local.get $result
  )
)
